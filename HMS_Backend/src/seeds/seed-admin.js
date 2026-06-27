const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ROLES = require("../constants/roles");
const STATUS = require("../constants/status");

const seedSuperAdmin = async () => {
  try {
    const existingSuperAdmin = await User.findOne({
      email: "superadmin@hms.com",
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists");
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

    console.log("Super Admin created successfully");
  } catch (error) {
    console.error("Super Admin seeding failed:", error.message);
  }
};

module.exports = seedSuperAdmin;
