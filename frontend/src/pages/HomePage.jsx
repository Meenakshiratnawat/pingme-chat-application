import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import { useState, useEffect } from "react";
import { connectSocket } from "../lib/socket";

const HomePage = ({ authUser,onlineUsers,setOnlineUsers }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (authUser?._id) {
      connectSocket(authUser._id, setOnlineUsers);
    }
  }, [authUser]);
  
console.log(selectedUser)
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              onlineUsers={onlineUsers}
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
  );
};
export default HomePage;
