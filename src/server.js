require("dotenv").config();

const connnectDB = require("./config/db");
const app = require("./app");
const seedAdmin = require("./seeds/seed-admin");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connnectDB();

    console.log("Seeding admin user...");
    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`Running on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed", error);
    process.exit(1);
  }
};

startServer();

console.log("Database connected successfully");
