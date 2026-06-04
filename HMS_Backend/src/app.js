require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

const app = express(); 
app.use(express.json());
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials:true,
    }),
); 
app.use(morgan("dev"));


const authRoutes = require("./routes/authRoutes");
app.use("/api/auth",authRoutes);




const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
startServer();

module.exports = app; 