const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ROLES = require("../constants/roles");
const STATUS = require("../constants/status");
const logger = require("../utils/logger");

const seedSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({
      email: "superadmin@hms.com",
    });

    if (existingSuperAdmin) {
      logger.info("Super Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      email: "superadmin@hms.com",
      passwordHash: hashedPassword,
      roles: [ROLES.SUPER_ADMIN],
      isFirstLogin: false,
      status: STATUS.ACTIVE,
    });

    logger.info("Super Admin created successfully");
  } catch (error) {
    logger.error("Super Admin seeding failed", { error });
  }
};

module.exports = seedSuperAdmin;
