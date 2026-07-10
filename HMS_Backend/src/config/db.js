const mongoose = require("mongoose");
const logger = require("../utils/logger");

const getMongoTarget = () => {
  try {
    const uri = new URL(process.env.MONGO_URI);

    return {
      protocol: uri.protocol,
      host: uri.host,
      database: uri.pathname.replace("/", "") || null,
    };
  } catch {
    return {
      protocol: null,
      host: null,
      database: null,
    };
  }
};

const formatConnectionError = (error) => ({
  name: error?.name,
  message: error?.message,
  code: error?.code,
  cause: error?.cause?.message || error?.cause,
  beforeHandshake: error?.beforeHandshake,
  reason: error?.reason?.type || error?.reason?.message,
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info("MongoDB connected successfully", getMongoTarget());
  } catch (error) {
    logger.error("Database connection failed", {
      mongo: getMongoTarget(),
      error: formatConnectionError(error),
    });
    process.exit(1);
  }
};
module.exports = connectDB;
