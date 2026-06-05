require("dotenv").config();
const helmet = require("helmet");
const express = require("express");
const employeeRoutes = require("./routes/employeeRoutes");
const app = express();

app.use(helmet());
app.use(express.json());
app.use("/api", employeeRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

module.exports = app;