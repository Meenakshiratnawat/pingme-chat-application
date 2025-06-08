import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { axiosInstance } from "../lib/axios";
import { getSocket, subscribeToMessages, unsubscribeFromMessages } from "../lib/socket";
import { formatMessageTime } from "../lib/utils";
import toast from "react-hot-toast";
import { Check, CheckCheck, MoreVertical } from "lucide-react";

const ChatContainer = ({ selectedUser, setSelectedUser, onlineUsers, authUser }) => {
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
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

    const socket = getSocket();
    socket.emit("chat-opened", {
      readerId: authUser._id,
      senderId: selectedUser._id,
    });

    const handleNewMessage = (newMessage) => {
      if (
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }

      // Re-emit chat-opened if you are the receiver
      if (
        newMessage.senderId === selectedUser._id && // message from selected user
        newMessage.receiverId === authUser._id // you are the receiver
      ) {
        const socket = getSocket();
        console.log("📤 Re-emitting chat-opened (chat already open)");
        socket.emit("chat-opened", {
          readerId: authUser._id,
          senderId: selectedUser._id,
        });
      }
    };

    const handleTyping = ({ senderId,receiverId }) => {
      console.log (senderId,"senderId")
      if (senderId === selectedUser._id) setIsTyping(true);
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) setIsTyping(false);
    };

    const handleMessagesRead = ({ senderId, readerId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.senderId === senderId &&
            msg.receiverId === readerId &&
            ["sent", "delivered"].includes(msg.status)
            ? { ...msg, status: "read" }
            : msg
        )
      );

      // fallback to ensure fresh state
      getMessages(selectedUser._id);
    };

    subscribeToMessages(handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messages-read", handleMessagesRead);

    return () => {
      unsubscribeFromMessages(handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messages-read", handleMessagesRead);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (isTyping && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isTyping]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col text-center text-zinc-500">
        <img src="/assets/chat-empty.svg" alt="Empty" className="w-40 h-40 mb-6" />
        <h2 className="text-xl font-semibold">Welcome to Chatty 👋</h2>
        <p className="text-sm mt-2">Select a conversation from the sidebar to start chatting.</p>
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader {...{ selectedUser, setSelectedUser, onlineUsers }} />
        <MessageSkeleton />
        <MessageInput {...{ selectedUser, authUser, setMessages }} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader {...{ selectedUser, setSelectedUser, onlineUsers }} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base-100">
        {messages.map((message) => {
          const isMe = message.senderId === authUser._id;

          return (
            <div
              key={`${message._id}-${message.status}`}
              className={`flex gap-2 items-end ${isMe ? "justify-end" : "justify-start"}`}
              ref={messageEndRef}
            >
              {!isMe && (
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border"
                />
              )}

              <div className="max-w-[80%]">
                <div
                  className={`rounded-xl px-4 py-2 text-sm whitespace-pre-line relative ${isMe
                      ? "bg-primary text-white rounded-br-none"
                      : "bg-base-200 text-base-content rounded-bl-none"
                    }`}
                >
                  {message.image && (
                    <img
                      src={message.image}
                      alt="attachment"
                      className="mb-1 rounded-md max-w-xs"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>

                {/* Ticks / Timestamps */}
                {isMe ? (
                  <div className="text-xs text-right mt-1 flex items-center justify-end gap-1 text-zinc-400">
                    <span>{formatMessageTime(message.createdAt)}</span>
                    {message.status === "sent" && <Check className="w-4 h-4" />}
                    {message.status === "delivered" && <CheckCheck className="w-4 h-4" />}
                    {message.status === "read" && (
                      <CheckCheck className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-400 mt-1">
                    {formatMessageTime(message.createdAt)}
                  </div>
                )}
              </div>

              {isMe && (
                <img
                  src={authUser.profilePic || "/avatar.png"}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border"
                />
              )}
            </div>
          );
        })}

       {isTyping && (
  <div className="flex items-center gap-2 px-2 mt-2 text-sm text-zinc-500">
    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"></span>
    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-150"></span>
    <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce delay-300"></span>
    <span className="ml-2 italic">{selectedUser.fullName} is typing...</span>
  </div>
)}
<div ref={messageEndRef} />
      </div>

      <MessageInput {...{ selectedUser, authUser, setMessages }} />
    </div>
  );
};

export default ChatContainer;