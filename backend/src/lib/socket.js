import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true                    

  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

socket.on("typing", ({ senderId, receiverId }) => {
  console.log(`📨 Server received typing from ${senderId} → ${receiverId}`);
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    console.log(`📤 Forwarding typing to socket: ${receiverSocketId}`);
    io.to(receiverSocketId).emit("typing", { senderId });
  }
});

socket.on("stopTyping", ({ senderId, receiverId }) => {
  console.log(`📨 Server received stopTyping from ${senderId} → ${receiverId}`);
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    console.log(`📤 Forwarding stopTyping to socket: ${receiverSocketId}`);
    io.to(receiverSocketId).emit("stopTyping", { senderId });
  }
});
  
});

export { io, app, server };


