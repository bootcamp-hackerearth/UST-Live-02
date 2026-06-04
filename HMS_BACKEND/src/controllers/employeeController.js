const User = require('../models/User');
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const Employee = require('../models/Employee');
const jwt = require("jsonwebtoken");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
exports.signUp = async (req, res) => {
  try {
    const { email, roles, employeeData } = req.body;

    const existingUser = await User.findOne({ userName: email });
    if (existingUser) {
      return res.status(400).json(
        new ApiError(400, "User already exists")
      );
    }
    const employee = await Employee.create(employeeData);
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    console.log("Temporary Password",tempPassword);
    const user = await User.create({
      userName: email,
      passwordHash,
      roles,
      employeeId: employee.employeeCode,
      mustResetPassword: true
    });
    return res.status(201).json(
      new ApiResponse(
        201,
        { employee, user },
        "Employee created successfully"
      )
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error.message || "Internal Server Error")
    );
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ userName: email }).populate("employeeId");
    if (!user) {
      return res.status(404).json(
        new ApiError(404, "User not found")
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(
        new ApiError(401, "Invalid password")
      );
    }

    const token = jwt.sign(
      { userId: user._id, role: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    if (user.mustResetPassword) {
      return res.status(200).json(
        new ApiResponse(200, { token, resetRequired: true }, "Password reset required")
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json(
      new ApiResponse(200, { token, user }, "Login successful")
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error.message || "Internal Server Error")
    );
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId } = req.user;
    const { newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json(
        new ApiError(404, "User not found")
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashedPassword;
    user.mustResetPassword = false;

    await user.save();

    return res.status(200).json(
      new ApiResponse(200, null, "Password updated successfully")
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error.message)
    );
  }
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-passwordHash")
      .populate("employeeId");

    if (!user) {
      return res.status(404).json(
        new ApiError(404, "User not found")
      );
    }

    return res.status(200).json(
      new ApiResponse(200, user, "Profile fetched successfully")
    );

  } catch (error) {
    return res.status(500).json(
      new ApiError(500, error.message)
    );
  }
};