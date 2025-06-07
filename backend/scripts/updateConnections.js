// scripts/updateConnections.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Connection from "../src/models/connection.model.js"; // adjust path if needed

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(" Connected to DB");

    const result = await Connection.updateMany(
      { status: "accepted" },
      { $set: { status: "pending" } }
    );

    console.log(`🔄 Updated ${result.modifiedCount} connections to 'pending'.`);
  } catch (error) {
    console.error(" Error updating connections:", error);
  } finally {
    mongoose.connection.close();
  }
};

run();

// scripts/deleteMessages.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import Connection from "../src/models/connection.model.js"; // adjust path if needed
// dotenv.config();

// const run = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log("✅ Connected to DB");

//     const result = await Connection.deleteMany({
//       status: "accepted"
//     });

//     console.log(`🧹 Deleted ${result.deletedCount} messages.`);
//   } catch (error) {
//     console.error("❌ Error deleting messages:", error);
//   } finally {
//     mongoose.connection.close();
//   }
// };

// run();