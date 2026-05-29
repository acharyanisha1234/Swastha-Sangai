import prisma from "../db/prisma.js";

// ===============================
// 🔹 GET COMMENTS BY POST
// ===============================
export const getCommentsByPost = async (req, res) => {
  try {
    const { donationId } = req.params;

    if (!donationId) {
      return res.status(400).json({
        success: false,
        message: "donationId required",
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        postId: parseInt(donationId),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
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
};


// ===============================
// 🔹 ADD COMMENT
// ===============================
export const addComment = async (req, res) => {
  try {
    const { postId, userId, content } = req.body;

    if (!postId || !userId || !content) {
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
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    // 🔥 SOCKET EMIT
    const io = req.app.get("io");
    if (io) {
      io.emit("newComment", newComment);
    }

    return res.status(201).json({
      success: true,
      comment: newComment,
      message: "Comment added successfully",
    });

  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};


// ===============================
// 🔹 UPDATE COMMENT
// ===============================
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id || !content) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: parseInt(id),
      },
      data: {
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profileImage: true,
          },
        },
      },
    });

    // 🔥 SOCKET EMIT
    const io = req.app.get("io");
    if (io) {
      io.emit("updateComment", updatedComment);
    }

    return res.json({
      success: true,
      comment: updatedComment,
      message: "Comment updated successfully",
    });

  } catch (error) {
    console.error("UPDATE COMMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment",
    });
  }
};


// ===============================
// 🔹 DELETE COMMENT
// ===============================
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Comment ID required",
      });
    }

    const deleted = await prisma.comment.delete({
      where: {
        id: parseInt(id),
      },
    });

    // 🔥 SOCKET EMIT
    const io = req.app.get("io");
    if (io) {
      io.emit("deleteComment", deleted.id);
    }

    return res.json({
      success: true,
      message: "Comment deleted successfully",
      id: deleted.id,
    });

  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment",
    });
  }
};s