import Connection from "../models/connection.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// 🟢 Send or Auto-Accept Connection
export const sendConnectionRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // 1️⃣ Auto-accept if reverse request exists
    const reverse = await Connection.findOne({
      sender: receiverId,
      receiver: senderId,
      status: "pending",
    });

    if (reverse) {
      reverse.status = "accepted";
      await reverse.save();

      // 🧼 Don't create duplicate; just update forward if exists
      const forward = await Connection.findOne({
        sender: senderId,
        receiver: receiverId,
      });

      if (forward && forward.status !== "accepted") {
        forward.status = "accepted";
        await forward.save();
      }

      // ✅ Notify sender of acceptance
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("contact-request-accepted", {
          receiverId,
          receiverName: req.user.fullName,
          message: `${req.user.fullName} accepted your request.`,
        });
      }

      return res.status(200).json({ message: "Auto-accepted connection from both sides" });
    }

    // 2️⃣ Check if request already sent
    const existing = await Connection.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existing) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // 3️⃣ Create pending connection
    const newConnection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    // 🔔 Notify receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("contact-request-received", {
        senderId,
        senderName: req.user.fullName,
        message: `${req.user.fullName} wants to add you as a contact.`,
      });
    }

    res.status(201).json({ message: "Contact request sent", connection: newConnection });
  } catch (error) {
    console.error("❌ sendConnectionRequest error:", error);
    res.status(500).json({ message: "Failed to send contact request" });
  }
};

// 🟢 Accept Incoming Request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

const connection = await Connection.findOneAndUpdate(
  {
    $or: [
      { sender: senderId, receiver: receiverId, status: "pending" },
      { sender: receiverId, receiver: senderId, status: "pending" },
    ],
  },
  { status: "accepted" },
  { new: true }
);

    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // 🔔 Notify sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("contact-request-accepted", {
        receiverId,
        receiverName: req.user.fullName,
        message: `${req.user.fullName} accepted your request.`,
      });
    }

    res.status(200).json({ message: "Request accepted", connection });
  } catch (error) {
    console.error("❌ acceptConnectionRequest error:", error);
    res.status(500).json({ message: "Failed to accept request" });
  }
};

// 🟢 Get Accepted Connections
export const getAcceptedConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ sender: userId }, { receiver: userId }],
      status: "accepted",
    }).populate("sender receiver", "-password");

    const connectedUsers = connections.map((conn) =>
      conn.sender._id.toString() === userId.toString() ? conn.receiver : conn.sender
    );

    res.status(200).json(connectedUsers);
  } catch (err) {
    console.error("❌ getAcceptedConnections error:", err);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
};

// 🟢 Get Incoming Pending Requests (for receiver)
export const getPendingRequests = async (req, res) => {
  try {
    const pending = await Connection.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "fullName profilePic");

    res.status(200).json(pending);
  } catch (err) {
    console.error("❌ getPendingRequests error:", err);
    res.status(500).json({ message: "Failed to fetch pending requests" });
  }
};