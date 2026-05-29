import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import friendshipRouter from "./routes/friendship.route.js";
import donationRouter from "./routes/donation.route.js";
import commentRouter from "./routes/comment.route.js";
import streakRoutes from "./routes/streakRoutes.js";
import chatRouter from "./routes/chat.route.js"; // ADD THIS - NEW IMPORT

import { fileURLToPath } from "url";
import path from "path";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


// 🔥 CREATE HTTP SERVER

const server = http.createServer(app);


// 🔥 SOCKET.IO SETUP

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://192.168.1.139:5173"],
    credentials: true
  }
});

const users = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// 🔥 ONLINE USERS UPDATE

const updateOnlineUsers = () => {
  const onlineUserIds = Array.from(users.keys());
  console.log("Online Users:", onlineUserIds);

  io.emit("onlineUsers", onlineUserIds);
};


// 🔌 SOCKET SERVER

io.on("connection", (socket) => {
  console.log(`🟢 User Connected: ${socket.id}`);

  socket.on("register", (userId) => {
    const existingSocketId = users.get(userId);

    if (existingSocketId && existingSocketId !== socket.id) {
      io.sockets.sockets.get(existingSocketId)?.disconnect(true);
    }

    users.set(userId, socket.id);
    
    // Add user to personal room for streak updates
    socket.join(`user-${userId}`);
    
    updateOnlineUsers();
  });

  //  Add handler for streak tracker
  socket.on("user-join", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined streak room`);
  });

  socket.on("outgoing:call", ({ fromOffer, to }) => {
    const targetSocketId = users.get(to);
    if (targetSocketId) {
      socket.to(targetSocketId).emit("incoming:call", {
        from: socket.id,
        offer: fromOffer,
      });
    }
  });

  socket.on("end-call", ({ to }) => {
    io.to(to).emit("call-ended");
  });

  socket.on("ice-candidate", ({ candidate, to }) => {
    if (to) {
      socket.to(to).emit("ice-candidate", { candidate });
    }
  });

  socket.on("call:accepted", ({ answer, to }) => {
    if (to) {
      socket.to(to).emit("incoming:answer", {
        from: socket.id,
        answer,
      });
    }
  });

  // ============= CHAT SYSTEM EVENTS (ADDED - NEW) =============
  
  socket.on('join-chat-session', async (data) => {
    const { sessionId, userId } = data;
    console.log(`User ${userId} joining chat session ${sessionId}`);
    socket.join(`chat-session:${sessionId}`);
    
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      const messages = await prisma.chatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' }
      });
      
      socket.emit('chat-history', messages);
      
      if (messages.length === 0) {
        const welcomeMessage = {
          role: 'assistant',
          content: `🙏 Namaste! Welcome to Swastha Sangai! 👋\n\nI'm your health assistant. How can I help you today?`
        };
        
        await prisma.chatMessage.create({
          data: {
            content: welcomeMessage.content,
            role: welcomeMessage.role,
            sessionId: sessionId,
            userId: userId ? Number(userId) : null
          }
        });
        
        socket.emit('new-chat-message', welcomeMessage);
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error joining chat session:', error);
      socket.emit('chat-error', { message: 'Failed to load chat history' });
    }
  });

  socket.on('send-chat-message', async (data) => {
    const { message, sessionId, userId } = data;
    console.log(`Message received: "${message}" for session ${sessionId}`);
    
    if (!message || !sessionId) return;
    
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      // Save user message
      const userMessage = await prisma.chatMessage.create({
        data: {
          content: message,
          role: 'user',
          sessionId: sessionId,
          userId: userId ? Number(userId) : null
        }
      });
      
      io.to(`chat-session:${sessionId}`).emit('new-chat-message', {
        id: userMessage.id,
        role: 'user',
        content: message,
        createdAt: userMessage.createdAt
      });
      
      // Update session
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() }
      });
      
      // Simple response system
      const responses = {
        "hello": "Hello! How can I help you with your health today?",
        "hi": "Hi there! I'm your health assistant. What brings you here?",
        "symptoms": "Please describe your symptoms in detail. When did they start?",
        "fever": "For fever, rest properly and stay hydrated. Consult doctor if fever persists.",
        "headache": "Rest in a dark room and apply cold compress. Drink plenty of water.",
        "cough": "Drink warm water with honey. Avoid cold items.",
        "stomach": "Eat light meals and avoid spicy food. Stay hydrated.",
        "workout": "Regular exercise is great! Start with 30 mins daily.",
        "diet": "Eat balanced diet with vegetables, fruits, and protein.",
        "mental": "Take breaks, talk to someone. Your mental health matters!",
        "thanks": "You're welcome! Stay healthy! 😊",
        "default": "I'm here to help with health questions. Ask me about symptoms, diet, exercise, or general health tips!"
      };
      
      let reply = responses.default;
      const lowerMsg = message.toLowerCase();
      
      for (const [key, value] of Object.entries(responses)) {
        if (lowerMsg.includes(key)) {
          reply = value;
          break;
        }
      }
      
      // Save bot response
      const botMessage = await prisma.chatMessage.create({
        data: {
          content: reply,
          role: 'assistant',
          sessionId: sessionId,
          userId: userId ? Number(userId) : null
        }
      });
      
      io.to(`chat-session:${sessionId}`).emit('new-chat-message', {
        id: botMessage.id,
        role: 'assistant',
        content: reply,
        createdAt: botMessage.createdAt
      });
      
      await prisma.$disconnect();
      
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('chat-error', { message: 'Failed to process message' });
    }
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
      }
    }

    updateOnlineUsers();
    console.log(`🔴 User Disconnected: ${socket.id}`);
  });
});

// ===============================
// 🧠 MIDDLEWARE
// ===============================
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://192.168.1.139:5173"],
    credentials: true,
  })
);

//  IMPORTANT (for comments socket)
app.set("io", io);

// Add middleware to attach io to req for streak routes
app.use((req, res, next) => {
  req.io = io;
  next();
});


// 📁 STATIC FILES

app.use(
  "/profile-pics",
  express.static(path.join(__dirname, "profile-pics"))
);

app.use(
  "/donation-images",
  express.static(path.join(__dirname, "donation-images"))
);


// 📡 ROUTES

app.get("/", (req, res) => {
  res.send("Server is running ....");
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/friendship", friendshipRouter);
app.use("/api/donations", donationRouter);

//  COMMENT ROUTE
app.use("/api/comments", commentRouter);

//  ADD STREAK ROUTES
app.use("/api/workout", streakRoutes);

// ADD CHAT ROUTE - NEW
app.use("/api/chat", chatRouter);


// 🚀 START SERVER

server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`✅ Routes available:`);
  console.log(`   - /api/auth`);
  console.log(`   - /api/user`);
  console.log(`   - /api/friendship`);
  console.log(`   - /api/donations`);
  console.log(`   - /api/comments`);
  console.log(`   - /api/workout/streak`);
  console.log(app.use("/api/chat", chatRouter));
});