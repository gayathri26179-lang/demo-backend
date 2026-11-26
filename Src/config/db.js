const mongoose = require("mongoose");
const storage = require("../services/storage");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("[Database] MONGODB_URI not configured. Operating in high-performance local persistent JSON storage mode.");
    return;
  }

  try {
    console.log("[Database] Attempting connection to MongoDB...");
    // 3.5s timeout so startup is never delayed if MongoDB is unreachable
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500
    });
    console.log("[Database] MongoDB Connected Successfully!");
  } catch (error) {
    console.warn(`[Database] MongoDB connection unavailable (${error.message}).`);
    console.log("[Database] Running with zero-downtime local JSON persistence engine in demo-backend/data/.");
  }
};

module.exports = connectDB;
