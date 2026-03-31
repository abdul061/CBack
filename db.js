const mongoose = require("mongoose");

const MONGODB = process.env.MONGODB;

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("✅ Already connected");
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB);
    isConnected = db.connections[0].readyState;
    console.log("🚀 MongoDB Connected");
  } catch (error) {
    console.error("❌ DB Error:", error);
    throw error;
  }
};

module.exports = connectDB;