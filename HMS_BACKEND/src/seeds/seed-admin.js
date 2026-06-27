const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ROLES = require("../constants/roles");
const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    if (existingAdmin) {
      existingAdmin.passwordHash = existingAdmin.passwordHash || hashedPassword;
      existingAdmin.roles = [ROLES.SUPER_ADMIN];
      existingAdmin.isFirstLogin = false;
      await existingAdmin.save();
      console.log("Super Admin already exists and role was updated");
      return;
    }

    await User.create({
      email: "admin@gmail.com",
      passwordHash: hashedPassword,
      roles: [ROLES.SUPER_ADMIN],
      isFirstLogin: false,
    });

    console.log("Super Admin created successfully");
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
  }
};

module.exports = seedAdmin;
