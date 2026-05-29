import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { SocketContext } from "../context/SocketContext";
import { toast } from "react-toastify";

const CommentSection = ({ donationId, onCommentSuccess }) => {
  const { userData, backendUrl } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch comments
  const fetchComments = async () => {
    if (!donationId) return;
    try {
      const res = await axios.get(`${backendUrl}/api/comments/${donationId}`);
      setComments(res.data?.comments || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [donationId]);

  // Socket
  useEffect(() => {
    if (!socket) return;

    socket.on("newComment", (newComment) => {
      if (newComment.postId === donationId) {
        setComments((prev) => [newComment, ...prev]);
      }
    });

    socket.on("updateComment", (updated) => {
      setComments((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    });

    socket.on("deleteComment", (id) => {
      setComments((prev) => prev.filter((c) => c.id !== id));
    });

    return () => {
      socket.off("newComment");
      socket.off("updateComment");
      socket.off("deleteComment");
    };
  }, [socket, donationId]);

  // POST / UPDATE
  const postComment = async () => {
    if (!text.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${backendUrl}/api/comments/${editingId}`,
          { content: text }
        );
        toast.success("Your comment is edited");
        setEditingId(null);
      } else {
        await axios.post(
          `${backendUrl}/api/comments`,
          {
            postId: donationId,
            userId: userData?.id,
            content: text,
          }
        );
        toast.success("Your comment is successfully posted");
      }

      setText("");
      fetchComments();
      if (onCommentSuccess) onCommentSuccess();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create comment");
    }
  };

  // DELETE
  const deleteComment = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/comments/${id}`);
      fetchComments();
      toast.success("Your comment is deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  const editComment = (c) => {
    setText(c.content);
    setEditingId(c.id);
  };

  const cancelEdit = () => {
    setText("");
    setEditingId(null);
  };

  return (
    <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <span>💬</span>
        Comments ({comments.length})
      </h3>

      {/* Input Section */}
      <div className="flex gap-2 mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 p-2.5 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500 border border-gray-600"
        />
        {editingId && (
          <button
            onClick={cancelEdit}
            className="bg-gray-600 px-4 py-2.5 rounded-lg text-white hover:bg-gray-500 transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={postComment}
          className="bg-gradient-to-r from-green-600 to-green-500 px-5 py-2.5 rounded-lg text-white hover:from-green-500 hover:to-green-400 transition-all font-medium shadow-lg"
        >
          {editingId ? "Update" : "Post"}
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No comments yet</p>
            <p className="text-gray-500 text-xs mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {c.user?.fullName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {c.user?.fullName || "User"}
                    </p>
                    <span className="text-gray-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm ml-8">{c.content}</p>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => editComment(c)}
                    className="text-blue-400 text-xs hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-500/20 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-red-400 text-xs hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;