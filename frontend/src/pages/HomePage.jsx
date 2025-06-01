import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { connectSocket, getSocket } from "../lib/socket";
import useContactRequestNotification from "../components/useContactRequestListener";
import { axiosInstance } from "../lib/axios"; // ✅ Needed for contact refresh

const HomePage = ({ authUser, onlineUsers, setOnlineUsers }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [hasNewRequest, setHasNewRequest] = useState(false);
  const [contacts, setContacts] = useState([]); // ✅ accepted contacts

  // 🔌 Connect to socket and join room
  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id, setOnlineUsers);
      const socket = getSocket();
      socket.emit("join", authUser._id);
    }
  }, [authUser]);

  // 🔴 Show red dot on navbar when new contact request arrives
  useContactRequestNotification(authUser, () => setHasNewRequest(true));
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axiosInstance.get("/connections/accepted");
        setContacts(res.data); // 👉 list of accepted contacts
      } catch (err) {
        console.error("❌ Failed to fetch contacts", err);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!authUser?._id || !socket) return;

    const handleContactAccepted = ({ contact }) => {
      if (!contact || !contact._id) {
        console.warn("⚠️ contact-accepted event received with invalid contact:", contact);
        return;
      }

      // 👉 Add to contacts list (no duplicates)
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
        setAuthUser={setSelectedUser} // or setAuthUser if lifted
        hasNewRequest={hasNewRequest}
      />

      <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center pt-20 px-4">
          <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
            <div className="flex h-full rounded-lg overflow-hidden">
              <Sidebar
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                onlineUsers={onlineUsers}
                contacts={contacts} // 🟢 now this is dynamic and complete
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