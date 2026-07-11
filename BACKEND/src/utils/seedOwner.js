const bcrypt = require("bcrypt");

const User = require("../models/User.model");
const Role = require("../models/Role.model");
const Employee = require("../models/Employee.model");

const seedOwner = async () => {
  try {
    const ownerRole = await Role.findOne({
      name: "Owner",
    });

    if (!ownerRole) {
      throw new Error("Owner role not found. Seed roles first.");
    }

    const existingOwner = await User.findOne({
      email: "owner@gmail.com",
    });

    if (existingOwner) {
      const existingOwnerEmployee = await Employee.findOne({
        userId: existingOwner._id,
      });

      if (existingOwnerEmployee) {
        console.log("Owner already seeded");
      } else {
        await Employee.create({
          userId: existingOwner._id,
          employeeCode: "OWNER",
          phone: "9999999999",
          department: "Admin",
          designation: "Owner",
          status: "ACTIVE",
          joiningDate: new Date(),
        });
        console.log("Owner employee record created");
      }

      return;
    }

    const passwordHash = await bcrypt.hash("Owner@123", 12);

    const user = await User.create({
      firstName: "System",
      lastName: "Owner",
      email: "owner@gmail.com",
      passwordHash,
      roleId: ownerRole._id,
      isVerified: true,
      status: "ACTIVE",
      mustChangePassword: false,
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await Employee.create({
      userId: user._id,
      employeeCode: "OWNER",
      phone: "9999999999",
      department: "Admin",
      designation: "Owner",
      status: "ACTIVE",
      joiningDate: new Date(),
    });

    console.log(" Owner seeded successfully");
  } catch (error) {
    if (error.code === 11000) {
      console.log(" Owner already seeded");
    } else {
      console.error(" Error seeding Owner:", error.message);
    }
  }
};

module.exports = seedOwner;
