const mongoose = require("mongoose");

const connectDatabase = async () => {

  if (mongoose.connection.readyState >= 1) return;

  console.log("Connecting to MongoDB...");

  await mongoose.connect(process.env.MONGO_URI);

  console.log("MongoDB connected");
};

module.exports = connectDatabase;