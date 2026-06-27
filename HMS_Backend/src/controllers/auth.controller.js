const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");

const loginUser = require("../services/auth/login.service");
const getCurrentLoggedInUser = require("../services/auth/get-current-user.service");
const createEmployeePassword = require("../services/auth/create-password.service");
const registerEmployeeSelf = require("../services/auth/registerEmployeeSelf.service");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = asyncHandler(async (req, res) => {
  const loginResponse = await loginUser(req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Login successful", loginResponse));
});

const createPassword = asyncHandler(async (req, res) => {
  const serviceResponse = await createEmployeePassword(req.body);

  return res.status(200).json(new ApiResponse(200, serviceResponse.message));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getCurrentLoggedInUser(req.user.userId);

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile retrieved successfully", user));
});

const register = asyncHandler(async (req, res) => {
  const result = await registerEmployeeSelf(req.body);

  return res.status(201).json(new ApiResponse(201, result.message));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      404,
      "No account found with the provided email address",
      "NOT_FOUND",
    );
  }

  return res.status(200).json(
    new ApiResponse(200, "Security question retrieved successfully", {
      securityQuestion: user.securityQuestion,
    }),
  );
});

const resetPassword = asyncHandler(async (req, res) => {
  const { securityAnswer, newPassword } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(
      404,
      "No account found with the provided email address",
      "NOT_FOUND",
    );
  }

  const isValidAnswer = await bcrypt.compare(
    securityAnswer.trim().toLowerCase(),
    user.securityAnswer,
  );

  if (!isValidAnswer) {
    throw new ApiError(401, "Security answer is incorrect", "UNAUTHORIZED");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new ApiError(
      409,
      "New password must be different from the current password",
      "CONFLICT",
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.passwordHash = hashedPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Password reset successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required", "UNAUTHORIZED");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Invalid refresh token", "UNAUTHORIZED");
  }

  const accessToken = jwt.sign(
    {
      userId: user._id,
      employeeId: user.employeeId,
      patientId: user.patientId,
      roles: user.roles,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    },
  );

  return res.status(200).json(
    new ApiResponse(200, "Access token refreshed successfully", {
      accessToken,
    }),
  );
});

const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(200)
      .json(new ApiResponse(200, "Logged out successfully"));
  }

  const user = await User.findOne({ refreshToken });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  return res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});

module.exports = {
  login,
  createPassword,
  getCurrentUser,
  register,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
};
