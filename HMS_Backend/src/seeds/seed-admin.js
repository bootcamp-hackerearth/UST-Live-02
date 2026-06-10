const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ROLES = require("../constants/roles");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await User.create({
      email: process.env.ADMIN_EMAIL,
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
