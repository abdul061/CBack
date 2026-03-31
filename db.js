const mongoose = require("mongoose");

const MONGODB = process.env.MONGODB;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn; // ✅ reuse existing connection
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB).then((mongoose) => {
      console.log("✅ DB Connected");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;