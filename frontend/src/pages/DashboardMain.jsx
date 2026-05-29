import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdApproval } from "react-icons/md";
import axios from "axios";
import CommentSection from "../components/CommentSection";

const DashboardMain = () => {
  const navigate = useNavigate();
  const { userData, backendUrl } = useContext(AuthContext);

  const [sentPendingRequests, setSentPendingRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [incomingDonationApps, setIncomingDonationApps] = useState([]);
  const [outgoingDonationApps, setOutgoingDonationApps] = useState([]);
  const [receivedPendingRequests, setReceivedPendingRequests] = useState([]);

  // Track which posts have their comment section open
  const [openCommentPostId, setOpenCommentPostId] = useState(null);

  // ================= FETCH INCOMING APPLICATIONS =================
  const fetchIncomingDonationApplications = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/donations/incoming-applications`,
        { withCredentials: true }
      );
      setIncomingDonationApps(response.data?.applications || []);
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchIncomingDonationApplications();
  }, []);

  // ================= FETCH OUTGOING APPLICATIONS =================
  const fetchOutgoingDonationApplications = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/donations/outgoing-applications`,
        { withCredentials: true }
      );
      setOutgoingDonationApps(response.data?.applications || []);
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchOutgoingDonationApplications();
  }, []);

  // ================= FETCH DONATIONS =================
  const fetchDonations = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/donations`, {
        withCredentials: true,
      });
      setDonations(res.data?.donations || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch donations");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // ================= FRIEND REQUESTS =================
  const fetchSentPendingRequests = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/friendship/sent-pending-requests`,
        { withCredentials: true }
      );
      setSentPendingRequests(response.data?.sentRequests || []);
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const fetchReceivedPendingRequests = async () => {
    try {
      const response = await axios.get(
        `${backendUrl}/api/friendship/received-pending-requests`,
        { withCredentials: true }
      );
      setReceivedPendingRequests(response.data?.receivedRequests || []);
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  useEffect(() => {
    fetchReceivedPendingRequests();
    fetchSentPendingRequests();
  }, []);

  // ================= ACTIONS =================
  const acceptApplication = async (data) => {
    try {
      await axios.patch(
        `${backendUrl}/api/donations/application/status`,
        data,
        { withCredentials: true }
      );
      toast.success("Application accepted successfully.");
      fetchIncomingDonationApplications(); // refresh
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const acceptFriendRequest = async (senderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/friendship/accept-request`,
        { senderId },
        { withCredentials: true }
      );
      toast.success(response?.data?.message);
      fetchReceivedPendingRequests();
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-3">
      {/* ================= TOP SECTION ================= */}
      <div className="flex w-full gap-3 p-3 h-1/2">
        {/* INCOMING REQUESTS */}
        <div className="w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10">
          <span className="text-2xl text-foreground/80">
            _ Incoming Pending Requests
          </span>
          <div className="flex flex-col gap-3 overflow-scroll h-[85%]">
            {receivedPendingRequests.length > 0 ? (
              receivedPendingRequests.map((request) => (
                <div
                  key={request?.id}
                  className="w-full min-h-20 bg-foreground/20 flex justify-between items-center px-3 rounded-xl"
                >
                  <div className="flex gap-4 items-center">
                    <Avatar onClick={() => navigate("/home/fitness-profile")}>
                      <AvatarImage
                        src={
                          request?.sender?.profileImage
                            ? `${backendUrl}/profile-pics/${request?.sender?.profileImage}`
                            : "/profile_pic_placeholder.jpg"
                        }
                      />
                      <AvatarFallback>IMG</AvatarFallback>
                    </Avatar>
                    <div>
                      <span>{request?.sender?.fullName || "Unknown"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      acceptFriendRequest(request?.sender?.id)
                    }
                  >
                    Accept
                  </button>
                </div>
              ))
            ) : (
              <span>No incoming requests</span>
            )}
          </div>
        </div>

        {/* OUTGOING REQUESTS */}
        <div className="w-2/4 h-full flex flex-col gap-3 py-3 px-5 rounded-xl bg-foreground/10">
          <span className="text-2xl text-foreground/80">
            _ Outgoing Pending Requests
          </span>
          <div className="flex flex-col gap-3 overflow-scroll h-[85%]">
            {sentPendingRequests.length > 0 ? (
              sentPendingRequests.map((request) => (
                <div key={request?.id}>
                  <span>{request?.receiver?.fullName || "Unknown"}</span>
                </div>
              ))
            ) : (
              <span>No outgoing requests</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION ================= */}
      <div className="flex w-full gap-3 p-3 h-1/2">
        {/* INCOMING DONATION APPS */}
        <div className="w-2/4 bg-foreground/10 p-5 rounded-xl">
          <span>_ Incoming Donation Applications</span>

          {incomingDonationApps
            ?.filter((app) => app?.donationPost)
            ?.map((app) => (
              <div
                key={app?.id}
                className="bg-foreground/20 p-3 rounded-lg mb-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold">
                      {app?.donationPost?.title || "No Title"}
                    </span>
                    <p className="text-gray-300">
                      {app?.donationPost?.description || "No Description"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      onClick={() =>
                        acceptApplication({
                          applicationId: app?.id,
                          status: "APPROVED",
                        })
                      }
                    >
                      Accept
                    </button>

                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      onClick={() => deletePost(app.id)}
                    >
                      Delete
                    </button>

                    {/* ✅ Comment button next to Delete */}
                    <button
                      className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600"
                      onClick={() =>
                        setOpenCommentPostId(
                          openCommentPostId === app.id ? null : app.id
                        )
                      }
                    >
                      Comment
                    </button>
                  </div>
                </div>

                {/* ✅ Show Comment Section when Comment button clicked */}
                {openCommentPostId === app.id && (
                  <CommentSection
                    donationId={app.id}
                    onCommentSuccess={() =>
                      toast.success(
                        "Your comment has been posted successfully."
                      )
                    }
                  />
                )}
              </div>
            ))}
        </div>

        {/* OUTGOING DONATION APPS */}
        <div className="w-2/4 bg-foreground/10 p-5 rounded-xl">
          <span>_ Outgoing Donation Applications</span>

          {outgoingDonationApps
            ?.filter((app) => app?.donationPost)
            ?.map((app) => (
              <div
                key={app?.id}
                className="bg-foreground/20 p-3 rounded-lg mb-3"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">
                    {app?.donationPost?.title || "No Title"}
                  </span>
                  <span>{app?.status?.toLowerCase() || "pending"}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ✅ Toast container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default DashboardMain;