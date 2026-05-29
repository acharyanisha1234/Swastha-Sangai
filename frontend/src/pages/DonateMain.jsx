import { SearchIcon } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { MdCreate, MdDelete, MdNotifications, MdComment } from "react-icons/md";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import CommentSection from "../components/CommentSection";

const DonateMain = () => {
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AuthContext);

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/donations`, {
        withCredentials: true,
      });
      setDonations(res.data.donations);
    } catch (error) {
      toast.error("Failed to fetch donations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const applyForDonation = async (donationPostId) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/donations/apply`,
        { donationPostId },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      fetchDonations();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Already applied");
    }
  };

  const deleteDonation = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/donations/${id}`, {
        withCredentials: true,
      });
      toast.success("Donation deleted");
      fetchDonations();
    } catch (error) {
      toast.error("Failed to delete donation");
    }
  };

  const handleCreateDonation = async () => {
    if (!newTitle || !newDescription) {
      return toast.error("Title and description are required");
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append("title", newTitle);
      formData.append("description", newDescription);
      if (newImage) formData.append("image", newImage);

      const res = await axios.post(`${backendUrl}/api/donations`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data.message);
      setShowCreateModal(false);
      setNewTitle("");
      setNewDescription("");
      setNewImage(null);

      fetchDonations();
    } catch (error) {
      toast.error("Failed to create donation");
    } finally {
      setCreating(false);
    }
  };

  const myDonations = donations.filter((d) => d.creatorId === userData?.id);
  const otherDonations = donations.filter(
    (d) => d.creatorId !== userData?.id && d.isActive === true
  );

  const [activeComments, setActiveComments] = useState(null);

  const handleToggleComments = (donationId) => {
    setActiveComments((prev) => (prev === donationId ? null : donationId));
  };

  return (
    <div className='w-full h-full flex flex-col px-8 py-6'>
      
      {/* Top Bar */}
      <div className='w-full bg-foreground/10 rounded-2xl p-4 flex justify-between items-center mb-8'>
        <div className='w-96 rounded-full bg-foreground/20 flex gap-3 items-center px-5 py-2.5'>
          <SearchIcon className="text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder='Search for Donation' 
            className='outline-none w-full bg-transparent text-white placeholder:text-gray-400 text-base' 
          />
        </div>
        <div className='flex items-center gap-6'>
          <MdNotifications size={24} className="text-gray-300 cursor-pointer hover:text-white" />
          <Avatar className="w-10 h-10 cursor-pointer" onClick={() => { navigate('/home/fitness-profile') }}>
            <AvatarImage
              src={userData?.profileImage ?
                `${backendUrl}/profile-pics/${userData?.profileImage}`
                : "/profile_pic_placeholder.jpg"
              }
              className="rounded-full object-cover"
            />
            <AvatarFallback>Profile</AvatarFallback>
          </Avatar>
        </div>
      </div>
    
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Donation <span className="text-green-400">Posts</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Share or apply for donation posts
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex gap-2 items-center px-6 py-2.5 bg-green-600 rounded-full hover:bg-green-500 transition-all font-medium shadow-lg"
        >
          <MdCreate size={20} /> Create Donation
        </button>
      </div>
      
      {/* Main Content */}
      <div className="flex gap-6 flex-1 min-h-0">
       
        {/* Your Posts Section */}
        <div className="w-1/2 bg-foreground/10 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <span className="text-xl font-semibold">Your Posts</span>
            <span className="ml-2 text-sm text-gray-400">({myDonations.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {myDonations.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400">You haven't created any donation posts.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-green-400 hover:text-green-300 text-sm font-medium"
                >
                  Create your first post →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myDonations.map((donation) => (
                  <div key={donation.id} className="bg-foreground/20 rounded-xl p-4 hover:bg-foreground/30 transition-all">
                    <div className="flex gap-4">
                      <img
                        src={
                          donation.image
                            ? `${backendUrl}/donation-images/${donation.image}`
                            : "/donation_placeholder.jpg"
                        }
                        className="w-32 h-28 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {donation.title}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {donation.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setNewTitle(donation.title);
                                setNewDescription(donation.description);
                                setShowCreateModal(true);
                              }}
                              className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all text-sm font-medium"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => deleteDonation(donation.id)}
                              className="px-4 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium"
                            >
                              Delete
                            </button>

                            <button
                              onClick={() => handleToggleComments(donation.id)}
                              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-medium"
                            >
                              Comment
                            </button>
                          </div>

                          <span
                            className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                              donation.isActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {donation.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {activeComments === donation.id && (
                      <div className="mt-4">
                        <CommentSection donationId={donation.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      
        {/* Available Donations Section */}
        <div className="w-1/2 bg-foreground/10 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <span className="text-xl font-semibold">Available Donations</span>
            <span className="ml-2 text-sm text-gray-400">({otherDonations.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {otherDonations.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-base">No active donation posts available.</p>
                <p className="text-gray-500 text-sm mt-2">Check back later for new donations!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {otherDonations.map((donation) => (
                  <div key={donation.id} className="bg-foreground/20 rounded-xl p-4 hover:bg-foreground/30 transition-all">
                    <div className="flex gap-4">
                      <img
                        src={
                          donation.image
                            ? `${backendUrl}/donation-images/${donation.image}`
                            : "/donation_placeholder.jpg"
                        }
                        className="w-32 h-28 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {donation.title}
                          </h3>
                          <p className="text-sm text-gray-300">
                            {donation.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <button
                            onClick={() => applyForDonation(donation.id)}
                            className="px-5 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm font-medium"
                          >
                            Apply
                          </button>

                          <button
                            onClick={() => handleToggleComments(donation.id)}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-medium"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>

                    {activeComments === donation.id && (
                      <div className="mt-4">
                        <CommentSection donationId={donation.id} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Create Donation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl w-[500px] max-w-[90%] p-6 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-5">Create New Donation</h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none text-base"
              />

              <textarea
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-green-500 focus:outline-none resize-none text-base"
              />

              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center hover:border-gray-600 transition-all">
                <input
                  type="file"
                  id="image-upload"
                  onChange={(e) => setNewImage(e.target.files[0])}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                >
                  {newImage ? newImage.name : "📷 Click to upload image"}
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTitle("");
                  setNewDescription("");
                  setNewImage(null);
                }}
                className="px-5 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateDonation}
                disabled={creating}
                className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition-all disabled:opacity-50 font-medium"
              >
                {creating ? "Creating..." : "Create Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonateMain;