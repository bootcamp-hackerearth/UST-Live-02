require("dotenv").config();
const { validateEnv } = require("./config/env");
const connnectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const app = require("./app");
const seedAdmin = require("./seeds/seed-admin");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnv();
    await connnectDB();
    await connectRedis();
    await seedAdmin();
    app.listen(PORT, () => {
      logger.info("Server started", { port: PORT });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};
startServer();
