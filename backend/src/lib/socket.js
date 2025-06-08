import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/message.model.js"; // 👈 import message model
import Connection from "../models/connection.model.js";
import User from "../models/user.model.js"; // or wherever your User model is

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

// used to store online users// {userId: socketId}
const userSocketMap = {};

io.on("connection", (socket) => {

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(` User ${userId} joined their room`);
  });

  socket.on("contact-request", ({ senderId, receiverId, senderName }) => {
    console.log(`📨 Contact request from ${senderId} to ${receiverId}`);
    io.to(receiverId).emit("contact-request-received", {
      senderId,
      senderName,
      message: `${senderName} wants to add you as a contact.`,
    });
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

  socket.on("contact-accept", async ({ senderId, receiverId }) => {
    try {
      // Try to find and accept a pending connection
      let connection = await Connection.findOneAndUpdate(
        {
          $or: [
            { sender: senderId, receiver: receiverId, status: "pending" },
            { sender: receiverId, receiver: senderId, status: "pending" },
          ],
        },
        { status: "accepted" },
        { new: true }
      );

      //  If not pending, maybe already accepted?
      if (!connection) {
        connection = await Connection.findOne({
          $or: [
            { sender: senderId, receiver: receiverId, status: "accepted" },
            { sender: receiverId, receiver: senderId, status: "accepted" },
          ]
        });

        if (!connection) {
          console.warn(" No pending or accepted connection found");
          return;
        }

        console.warn("Connection already accepted, re-emitting contact-accepted");
      }

      const actualSenderId = connection.sender.toString();
      const actualReceiverId = connection.receiver.toString();

      const [sender, receiver] = await Promise.all([
        User.findById(actualSenderId).select("-password"),
        User.findById(actualReceiverId).select("-password"),
      ]);

      if (!sender || !receiver) {
        console.warn(" User not found");
        return;
      }

      console.log(" Emitting contact-accepted to:", actualSenderId, actualReceiverId);

      //  Emit to both
      io.to(actualSenderId).emit("contact-accepted", { contact: receiver });
      io.to(actualReceiverId).emit("contact-accepted", { contact: sender });

    } catch (err) {
      console.error("Error in contact-accept handler:", err);
    }
  });
});

export { io, app, server };


