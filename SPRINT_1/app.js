require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const app = express();
const employeeRoutes = require("./src/routes/employeeRoutes");
const connectDB = require("./src/config/db");

// Used for secure http
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);


//middleware which logs requests
app.use(morgan("dev"));

// Read JSON data sent from frontend/Postman and make it available in req.body.
app.use(express.json());

app.use("/api",employeeRoutes);

app.get("/", (req, res) => res.json({ message: "API running" }));

connectDB();

module.exports = app;
