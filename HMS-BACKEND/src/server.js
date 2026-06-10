require("dotenv").config();
const connnectDB = require("./config/db");
const app = require("./app");
const seedAdmin = require("./seeds/seed-admin");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connnectDB();
    console.log("Database connected successfully");
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};
startServer();

