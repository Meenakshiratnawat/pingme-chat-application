
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { axiosInstance } from "../lib/axios";
import { getSocket, subscribeToMessages, unsubscribeFromMessages } from "../lib/socket";
import { formatMessageTime } from "../lib/utils";
import toast from "react-hot-toast";

const ChatContainer = ({ selectedUser, setSelectedUser, onlineUsers, authUser }) => {
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const messageEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
console.log(selectedUser,"selectedUser")



  const getMessages = async (userId) => {
    setIsMessagesLoading(true);
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      setMessages(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser._id);

    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    subscribeToMessages(handleNewMessage);

    return () => unsubscribeFromMessages(handleNewMessage);
  }, [selectedUser]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
     <ChatHeader
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  onlineUsers={onlineUsers}
/>        <MessageSkeleton />
<MessageInput
  authUser={authUser}
  selectedUser={selectedUser}
  setMessages={setMessages}
/>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
     <ChatHeader
  selectedUser={selectedUser}
  setSelectedUser={setSelectedUser}
  onlineUsers={onlineUsers}
/>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
         {isTyping && (
    <div className="text-sm italic text-base-content/60 px-2">
      {selectedUser.fullName} is typing...
    </div>
  )}
      </div>

<MessageInput
  authUser={authUser}
  selectedUser={selectedUser}
  setMessages={setMessages}
/>    </div>
  );
};

export default ChatContainer;
