const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const Employee = require("../models/Employee");
const User = require("../models/User");
const { sendEmail } = require("../utils/sendEmail");
const { verificationEmailTemplate } = require("../utils/emailFormat");

// SIGNUP

exports.signup = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      department,
      designation,
      status,
      joiningDate,
      medicalRegistrationNumber,
      specialisation,
      qualification,
      consultationFee,
      availabilitySlots
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const existingEmployee = await Employee.findOne({ email });

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const employee = new Employee({
      email,
      name,
      phone,
      department,
      designation,
      status,
      joiningDate,
      medicalRegistrationNumber,
      specialisation,
      qualification,
      consultationFee,
      availabilitySlots
    });

    const savedEmployee = await employee.save();

    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    const verificationTokenExpiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    );

    const user = await User.create({
      email,
      passwordHash,
      role: designation,
      employeeId: savedEmployee.employeeId,
      verificationToken,
      verificationTokenExpiry,
      isActive: false
    });

    const verificationUrl =
      `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify Your HMS Account",
      htmlContent: verificationEmailTemplate(
        name,
        verificationUrl
      )
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Verification email sent.",
      user: {
        email: user.email,
        role: user.role,
        employeeId: user.employeeId
      }
    });

  } catch (err) {
    console.error("SIGNUP ERROR:");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// LOGIN

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = Boolean(await bcrypt.compare(
      password,
      user.passwordHash
    ));

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    user.lastLoginAt = new Date();

    await user.save();

    const token = jwt.sign(
      {
        id: user.employeeId,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
        employeeId: user.employeeId
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// GET PROFILE

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      employeeId: req.user.id
    }).select("-passwordHash -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const employee = await Employee.findOne({
      employeeId: user.employeeId
    }).select("-__v");

    return res.status(200).json({
      success: true,
      user,
      employee
    });

  } catch (err) {
    console.error("GET PROFILE ERROR:");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ======================================================
// VERIFY EMAIL
// ======================================================

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: {
        $gt: new Date()
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    user.isActive = true;
    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (err) {
    console.error("VERIFY EMAIL ERROR:");
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};