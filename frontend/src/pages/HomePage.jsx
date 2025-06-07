import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { connectSocket, getSocket } from "../lib/socket";
import useContactRequestNotification from "../components/useContactRequestListener";
import { axiosInstance } from "../lib/axios";

const HomePage = ({ authUser, onlineUsers, setOnlineUsers }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasNewRequest, setHasNewRequest] = useState(false);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id, setOnlineUsers);
      const socket = getSocket();
      socket.emit("join", authUser._id);
    }
  }, [authUser]);

  useContactRequestNotification(authUser, () => setHasNewRequest(true));

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axiosInstance.get("/connections/accepted");
        setContacts(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!authUser?._id || !socket) return;
     socket.emit("join", authUser._id); 

    const handleContactAccepted = ({ contact }) => {
      if (!contact || !contact._id) {
        console.warn("⚠️ contact-accepted event received with invalid contact:", contact);
        return;
      }

      setContacts((prev) => {
        if (prev.find((u) => u._id === contact._id)) return prev;
        return [...prev, contact];
      });
    };

    socket.on("contact-accepted", handleContactAccepted);
    return () => socket.off("contact-accepted", handleContactAccepted);
  }, [authUser?._id]);

  return (
    <>
      <Navbar
        authUser={authUser}
        setAuthUser={setSelectedUser}
        hasNewRequest={hasNewRequest}
      />

      <div>
        <div className="flex items-center justify-center pt-5 px-4">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                onlineUsers={onlineUsers}
                contacts={contacts}
                authUser={authUser}
              />
              {!selectedUser ? (
                <NoChatSelected />
              ) : (
                <ChatContainer
                  authUser={authUser}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                  onlineUsers={onlineUsers}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;