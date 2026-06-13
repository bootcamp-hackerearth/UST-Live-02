const loginUser = require("../services/auth/login.service");
const getCurrentLoggedInUser = require("../services/auth/get-current-user.service");
const createEmployeePassword = require("../services/auth/create-password.service");
const registerEmployeeSelf = require("../services/auth/registerEmployeeSelf.service");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const loginResponse = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: loginResponse,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    if (
      error.message === "Invalid credentials" ||
      error.message === "Incorrect password"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to login at this time",
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
    const { email, securityAnswer, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with the provided email address",
      });
    }

    const isValidAnswer = await bcrypt.compare(
      securityAnswer.trim().toLowerCase(),
      user.securityAnswer
    );

    if (!isValidAnswer) {
      return res.status(401).json({
        success: false,
        message: "Security answer is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

    if (isSamePassword) {
      return res.status(409).json({
        success: false,
        message: "New password must be different from the current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
};
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        employeeId: user.employeeId,
        roles: user.roles,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
  success: true,
  message: "Access token refreshed successfully",
  data: {
    accessToken
  }
});
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Refresh token expired or invalid",
    });
  }
};
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    }

    const user = await User.findOne({
      refreshToken,
    });

    if (user) {
      user.refreshToken = null;

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
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
  refreshToken,
  logout
};