const loginUser = require("../services/auth/login.service");
const getCurrentLoggedInUser = require("../services/auth/get-current-user.service");
const createEmployeePassword = require("../services/auth/create-password.service");
const registerEmployeeSelf = require("../services/auth/registerEmployeeSelf.service");

const patientSignup = require("../services/patient/patient-signup.service");

const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Patient = require("../models/Patient");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  try {
    const loginResponse = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: loginResponse,
    });
  } catch (error) {
    console.error("LOGIN ERROR FULL STACK:", error);

    // known errors
    if (
      error.message === "Invalid credentials" ||
      error.message.includes("password") ||
      error.message.includes("required")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message === "Your account is pending admin approval" ||
      error.message === "Your registration was rejected" ||
      error.message === "Account is inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    // unknown errors (IMPORTANT FIX)
    return res.status(500).json({
      success: false,
      message: error.message, // 🔥 show real error instead of hiding
    });
  }
};
const createPassword = async (req, res) => {
  try {
    const serviceResponse = await createEmployeePassword(req.body);

    return res.status(200).json({
      success: true,
      message: serviceResponse.message,
    });
  } catch (error) {
    console.error("CREATE PASSWORD ERROR:", error);

    if (error.message === "Employee not found") {
      return res.status(404).json({
        success: false,
        message: "Employee record not found",
      });
    }

    if (error.message === "Password already created") {
      return res.status(409).json({
        success: false,
        message: "Password has already been created",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create password",
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await getCurrentLoggedInUser(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("GET CURRENT USER ERROR:", error);

    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
    });
  }
};

const register = async (req, res) => {
  try {
    const result = await registerEmployeeSelf(req.body);

    return res.status(201).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.message);

    if (error.message === "Medical registration number already exists") {
      return res.status(409).json({
        success: false,
        message: "Medical registration number already exists",
      });
    }

    if (error.message === "Phone number is already registered") {
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    if (error.message === "Email is already registered") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with the provided email address",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Security question retrieved successfully",
      securityQuestion: user.securityQuestion,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // -------------------------
    // Find user
    // -------------------------
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingPassword = user.passwordHash || user.temporaryPasswordHash;

    if (!existingPassword) {
      return res.status(400).json({
        success: false,
        message: "No password found for this user",
      });
    }

    // -------------------------
    // check same password
    // -------------------------
    const isSamePassword = await bcrypt.compare(newPassword, existingPassword);

    if (isSamePassword) {
      return res.status(409).json({
        success: false,
        message: "New password must be different",
      });
    }

    // -------------------------
    // save final password
    // -------------------------
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;

    // First login completed
    user.temporaryPasswordHash = null;
    user.isFirstLogin = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
const signupPatient = async (req, res) => {
  try {
    const serviceResponse = await patientSignup(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient signup successful",
      data: serviceResponse,
    });
  } catch (error) {
    console.error("PATIENT SIGNUP ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to signup patient",
    });
  }
};

module.exports = {
  login,
  createPassword,
  getCurrentUser,
  register,
  forgotPassword,
  resetPassword,
  signupPatient,
};
