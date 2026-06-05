const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const sendEmail = require("../utils/sendEmail");
const Employee = require("../models/Employee");
const User = require("../models/User");

const MEDICAL_REG_ROLES    =  new Set(["DOCTOR", "NURSE", "PHARMACIST"]);
const SPECIALISATION_ROLES = new Set(["DOCTOR", "LAB_TECH"]);

exports.signup = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      department,
      designation,
      joiningDate,
      medicalRegistrationNumber,
      specialisation,
      qualification,
      consultationFee,
      availabilitySlots,
    } = req.body;

   
    const [existingUser, existingEmployee] = await Promise.all([
      User.findOne({ email }),
      Employee.findOne({ email }),
    ]);

    if (existingUser || existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    if (MEDICAL_REG_ROLES.has(designation) && medicalRegistrationNumber) {
      const existingMRN = await Employee.findOne({ medicalRegistrationNumber });
      if (existingMRN) {
        return res.status(409).json({
          success: false,
          message: "Medical registration number already registered",
        });
      }
    }

    const employeeData = {
      email,
      name,
      phone,
      department,
      designation,
      joiningDate,
      qualification, 
    };

    if (MEDICAL_REG_ROLES.has(designation)) {
      employeeData.medicalRegistrationNumber = medicalRegistrationNumber;
    }

    if (SPECIALISATION_ROLES.has(designation)) {
      employeeData.specialisation = specialisation;
    }

    if (designation === "DOCTOR") {
      employeeData.consultationFee   = consultationFee;
      employeeData.availabilitySlots = availabilitySlots;
    }

  
    const employee = await new Employee(employeeData).save();

    const passwordHash = await bcrypt.hash(password, 12);
    const verification_token        = crypto.randomBytes(32).toString("hex");
    const verification_token_expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let user;
    try {
      user = await User.create({
        email,
        passwordHash,
        role: designation,
        employeeId: employee.employeeId,
        status: "ACTIVE",
        is_verified: false,
        verification_token,
        verification_token_expiry,
        createdAt: new Date()
      });
    } catch (userCreateError) {
      await Employee.findByIdAndDelete(employee._id);
      throw userCreateError;
    }

    
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verification_token}`;
    sendEmail({
      to: user.email,
      subject: "HMS — Verify Your Email",
      html: `
        <h2>Welcome to HMS</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email:</p>
        <a href="${verifyUrl}">Verify Email</a>
      `,
    }).catch((err) => console.error("Verification email failed:", err));

    return res.status(201).json({
      success: true,
      message: "Signup successful. Please verify your email before login",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Please verify your email" });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Your account is inactive" });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { employeeId: user.employeeId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        employeeId:  user.employeeId,
        email:       user.email,
        role:        user.role,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token missing",
      });
    }

    const user = await User.findOne({ verification_token: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token",
      });
    }

    if (user.verification_token_expiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification token expired",
      });
    }

    user.is_verified                = true;
    user.verification_token         = null;
    user.verification_token_expiry  = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Please login using your credentials",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findOne({ employeeId: req.user.employeeId })
      .select("-passwordHash -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profile = await Employee.findOne({ employeeId: user.employeeId })
      .select("-__v");

    if (!profile) {
      return res.status(404).json({ message: "Employee profile not found" });
    }

    return res.status(200).json({
      user: {
        employeeId:  user.employeeId,
        email:       user.email,
        role:        user.role,
        lastLoginAt: user.lastLoginAt,
      },
      profile,
    });
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: err.message });
  }
};