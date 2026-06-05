const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ROLES = require("../constants/roles");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@gmail.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      email: "admin@gmail.com",
      passwordHash: hashedPassword,
      roles: [ROLES.ADMIN],
      isFirstLogin: false,
    });

    console.log("Admin created successfully");
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
  }
};

module.exports = seedAdmin;
