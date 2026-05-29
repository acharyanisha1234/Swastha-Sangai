import express from "express";
import prisma from "../db/prisma.js";

const router = express.Router();


// ===============================
// GET COMMENTS FOR A DONATION
// ===============================
router.get("/:donationId", async (req, res) => {
  try {
    const donationId = parseInt(req.params.donationId);

    if (isNaN(donationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid donationId",
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: donationId,
      },
      include: {
        user: {
          select: {
            fullName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      comments,
    });

  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments",
    });
  }
});


// ===============================
// ADD COMMENT
// ===============================
router.post("/", async (req, res) => {
  try {
    const { postId, userId, content } = req.body;

    if (!postId || !content || !userId) {
      return res.status(400).json({
        success: false,
        message: "postId, userId and content required",
      });
    }

    const newComment = await prisma.comment.create({
      data: {
        postId: parseInt(postId),
        userId: parseInt(userId),
        content,
      },
      include: {
        user: {
          select: {
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    // 🔥 REAL-TIME SOCKET EMIT
    const io = req.app.get("io");
    if (io) {
      io.emit("newComment", newComment);
    }

    res.status(201).json({
      success: true,
      comment: newComment,
    });

  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
});


// ===============================
// DELETE COMMENT
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid comment id",
      });
    }

    await prisma.comment.delete({
      where: {
        id,
      },
    });

    res.json({
      success: true,
      message: "Comment deleted",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
});


// ===============================
// UPDATE COMMENT
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body;

    if (isNaN(id) || !content) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    const updated = await prisma.comment.update({
      where: {
        id,
      },
      data: {
        content,
      },
    });

    res.json({
      success: true,
      comment: updated,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
});

export default router;