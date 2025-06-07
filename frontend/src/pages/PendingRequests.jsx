import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../lib/socket";

const PendingRequests = ({ authUser }) => {
  const [pendingRequests, setPendingRequests] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await axiosInstance.get("/connections/pending");
      setPendingRequests(res.data);
    } catch (err) {
      toast.error("Failed to load pending requests");
    }
  };

  useEffect(() => {
    if (authUser?._id) {
      fetchPending();
    }
  }, [authUser?._id]);

  const handleAccept = async (senderId) => {
    try {
      await axiosInstance.post("/connections/accept", {
        senderId,
        receiverId: authUser._id,
      });
      toast.success("Connection accepted!");
      setPendingRequests((prev) => prev.filter((r) => r.sender._id !== senderId));
          const socket = getSocket();

    // 👇 Emit real-time event to notify sender (Alex)
    socket.emit("contact-accept", {
      senderId,
      receiverId: authUser._id,
    });
    } catch (err) {
      toast.error("Failed to accept request");
    }
  };

if (pendingRequests.length === 0) {
  return (
    <div className="p-6 flex flex-col items-center justify-center text-zinc-500">
      
      <h3 className="text-xl font-semibold">You're all caught up!</h3>
      <p className="text-sm mt-2 text-zinc-400">
        No pending requests at the moment.
      </p>
    </div>
  );
}

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Pending Requests</h2>
      <ul className="space-y-4">
        {pendingRequests.map(({ sender }) => (
          <li key={sender._id} className="flex items-center justify-between border p-3 rounded-lg">
            <div className="flex items-center gap-3">
              <img src={sender.profilePic || "/avatar.png"} alt="sender" className="w-10 h-10 rounded-full" />
              <p className="font-medium">{sender.fullName}</p>
            </div>
            <button className="btn btn-xs btn-success" onClick={() => handleAccept(sender._id)}>
              Accept
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingRequests;