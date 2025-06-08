import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development"
  ? "http://localhost:5001"
  : "/";

let socket;

export const connectSocket = (userId, onOnlineUsers) => {
  if (socket?.connected) return;

  socket = io(BASE_URL, {
    query: { userId },
    credentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
          socket.emit("join", userId);

  });

  socket.on("getOnlineUsers", (userIds) => {
    if (typeof onOnlineUsers === "function") {
      onOnlineUsers(userIds); // 👈 call the callback you pass from component
    }
  });
};

export const getSocket = () => socket;

export const subscribeToMessages = (callback) => {
  const socket = getSocket();
  if (!socket || !socket.connected) return;
  socket.on("newMessage", callback);
};

export const unsubscribeFromMessages = (callback) => {
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.off("newMessage", callback);
  }
};

