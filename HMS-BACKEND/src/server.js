require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const app = require("./app");
const connectDB = require('./config/db.js');
const logger = require('../src/utils/logger');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error('MONGO_URI is missing in .env file');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is missing in .env file');
  process.exit(1);
}

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

startServer();