// scripts/deleteMessages.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "../src/models/message.model.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to DB");

    const result = await Message.deleteMany({
      status: "read"
    });

    console.log(`🧹 Deleted ${result.deletedCount} messages.`);
  } catch (error) {
    console.error("❌ Error deleting messages:", error);
  } finally {
    mongoose.connection.close();
  }
};

run();