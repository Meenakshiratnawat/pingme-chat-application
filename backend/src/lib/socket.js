import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js"; // 👈 import message model

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
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId });
    }
  });

  socket.on("stopTyping", ({ senderId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId });
    }
  });

  socket.on("user-online", async ({ userId }) => {
    try {
      await Message.updateMany(
        { receiverId: userId, status: "sent" },
        { $set: { status: "delivered" } }
      );
    } catch (err) {
      console.error("Failed to mark messages as delivered:", err.message);
    }
  });

  // Read Receipt: mark messages as read when user opens chat
  socket.on("chat-opened", async ({ readerId, senderId }) => {

    try {
      //  Update all unread messages from sender → reader
      const updated = await Message.updateMany(
        {
          senderId,
          receiverId: readerId,
          status: { $ne: "read" },
        },
        { $set: { status: "read" } }
      );
      // .Emit back to the sender that their messages were read
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages-read", {
          senderId,
          readerId,
        });
      } else {
        console.log(" Sender not online, cannot emit messages-read");
      }
    } catch (err) {
      console.error(" Error in chat-opened:", err);
    }
  });
});

export { io, app, server };


