import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/chat-images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// Create session
export const createSession = async (req, res) => {
  try {
    const { userId } = req.body;
    const session = await prisma.chatSession.create({
      data: {
        userId: userId ? Number(userId) : null,
        title: 'New Chat',
        isActive: true
      }
    });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get history
export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Upload image
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `/uploads/chat-images/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      imageName: req.file.originalname 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Send message with AI
export const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, userId, imageUrl, imageName } = req.body;
    
    console.log('Received:', { message, sessionId, userId, imageUrl });
    
    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        content: message || (imageUrl ? '📷 Sent an image' : ''),
        role: 'user',
        imageUrl: imageUrl || null,
        imageName: imageName || null,
        sessionId: sessionId,
        userId: userId ? Number(userId) : null
      }
    });
    
    // Get AI response
    let reply;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are Swastha Sangai, a friendly health assistant. Give short, helpful responses about health. Be caring and supportive." 
          },
          { 
            role: "user", 
            content: message || (imageUrl ? "User shared a health-related image. Please provide general health advice." : "Hello") 
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });
      
      reply = completion.choices[0].message.content;
    } catch (aiError) {
      console.error('AI Error:', aiError);
      reply = getFallbackResponse(message);
    }
    
    // Save bot reply
    const botMessage = await prisma.chatMessage.create({
      data: {
        content: reply,
        role: 'assistant',
        sessionId: sessionId,
        userId: userId ? Number(userId) : null
      }
    });
    
    // Update session
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });
    
    res.json({ success: true, reply, messageId: botMessage.id });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Fallback responses
function getFallbackResponse(message) {
  const msg = (message || '').toLowerCase();
  
  if (msg.includes('hello') || msg.includes('hi')) {
    return 'Namaste! 🙏 How can I help with your health today?';
  }
  if (msg.includes('fever')) {
    return '🤒 For fever: Rest, stay hydrated, take paracetamol if needed. See doctor if fever > 102°F for 3 days.';
  }
  if (msg.includes('headache')) {
    return '🤕 For headache: Rest in dark room, drink water, apply cold compress.';
  }
  if (msg.includes('cough')) {
    return '😷 For cough: Drink warm water with honey, avoid cold items.';
  }
  if (msg.includes('workout') || msg.includes('exercise')) {
    return '🏋️ Exercise 30 mins daily. Start with warmup, stay consistent!';
  }
  if (msg.includes('diet') || msg.includes('food')) {
    return '🥗 Eat vegetables, fruits, protein. Drink 8 glasses water daily.';
  }
  if (msg.includes('help')) {
    return 'I can help with: Symptoms, Diet, Exercise, Mental health. What would you like?';
  }
  if (msg.includes('thank')) {
    return 'You\'re welcome! 😊 Stay healthy!';
  }
  
  return "I'm your health assistant. Ask me about fever, headache, diet, exercise, or any health concerns!";
}

export { upload };