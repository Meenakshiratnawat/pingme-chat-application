import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const receiverSocketId = getReceiverSocketId(receiverId);

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      status: receiverSocketId ? "delivered" : "sent" 
    });

    await newMessage.save();

    // Notify receiver if online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) return res.status(404).json({ message: "Not found" });

  if (message.senderId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!["sent", "delivered"].includes(message.status)) {
    return res.status(400).json({ message: "Cannot delete this message" });
  }

  message.text = "This message was deleted";
  message.image = null;
  await message.save();

  io.to(getReceiverSocketId(message.receiverId)).emit("message-deleted", message);
  res.status(200).json({ message: "Deleted" });
};


export const editMessage = async (req, res) => {
  const { text } = req.body;
  const message = await Message.findById(req.params.id);

  if (!message) return res.status(404).json({ message: "Not found" });

  if (message.senderId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (!["sent", "delivered"].includes(message.status)) {
    return res.status(400).json({ message: "Cannot edit this message" });
  }

  message.text = text;
  await message.save();

  io.to(getReceiverSocketId(message.receiverId)).emit("message-edited", message);
  res.status(200).json(message);
};