const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const User = require("../models/userModel");
const Employee = require("../models/employeeModel");
const { sendEmail } = require("../utils/emailService");
const { verificationEmailTemplate } = require("../utils/emailTemplate");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

const buildTokenPayload = (user) => ({
  id: user._id,
  userId: user.userId,
  email: user.email,
  roles: user.roles,
  status: user.status,
  employeeId: user.employeeId || null,
});

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      department,
      role,
      status,
      joiningDate,
      medicalRegistrationNumber,
      specialization,
      qualification,
      consultationFee,
      availabilitySlots,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim(), });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const employee = new Employee({
      email,
      name,
      phone,
      department,
      role,
      status,
      joiningDate,
      medicalRegistrationNumber,
      specialization,
      qualification,
      consultationFee,
      availabilitySlots,
    });

    const savedEmployee = await employee.save();

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await User.create({
      email,
      passwordHash: password_hash,
      roles: [role],
      employeeId: savedEmployee._id,
      verificationToken,
      verificationTokenExpiry,
      status: "INACTIVE",
    });

    const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        to: email,
        subject: "Verify Your HMS Account",
        htmlContent: verificationEmailTemplate(name, verificationUrl),
      });
    } catch (error) {
      logger.warn("Email failed:", error.message);
    }

    res.status(201).json({
      success: true,
      message: "Employee Created Successfully. Verification Email sent",
      data: savedEmployee,
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    })
      .select("+passwordHash +refreshToken")
      .populate("employeeId", "employeeCode name role department email phone");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status === "INACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your account is INACTIVE. Contact administrator",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const payload = buildTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({ id: user._id });

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user.userId,
        email: user.email,
        role: user.roles,
        status: user.status,
        lastLoginAt: user.lastLoginAt,
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error("login error: ", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "employeeId",
      "employeeCode name role department email phone specialization",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User Profile: ",
      data: {
        userId: user.userId,
        email: user.email,
        status: user.status,
        employee: user.employeeId || null,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error("Get User profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpiry: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.isActive = true;

    user.verificationToken = null;
    user.verificationTokenExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  verifyEmail,
};
