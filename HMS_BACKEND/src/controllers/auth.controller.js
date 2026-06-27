const loginUser = require("../services/auth/login.service");
const getCurrentLoggedInUser = require("../services/auth/get-current-user.service");
const createEmployeePassword = require("../services/auth/create-password.service");
const registerEmployeeSelf = require("../services/auth/registerEmployeeSelf.service");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ERR = require("../utils/errors");
//login
const login = asyncHandler(async (req, res) => {
  const loginResponse = await loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: loginResponse,
  });
});

const createPassword = asyncHandler(async (req, res) => {
  const serviceResponse = await createEmployeePassword(req.body);

  return res.status(200).json({
    success: true,
    message: serviceResponse.message,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await getCurrentLoggedInUser(req.user.userId);

  return res.status(200).json({
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
});

const register = asyncHandler(async (req, res) => {
  const result = await registerEmployeeSelf(req.body);

  return res.status(201).json({
    success: true,
    message: result.message,
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw ERR.accountNotFoundWithEmail();
  }

  if (!user.securityQuestion || !user.securityAnswer) {
    throw ERR.passwordRecoveryNotSet();
  }

  return res.status(200).json({
    success: true,
    message: "Security question retrieved successfully",
    securityQuestion: user.securityQuestion,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, securityAnswer, newPassword } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw ERR.accountNotFoundWithEmail();
  }

  const isValidAnswer = await bcrypt.compare(
    securityAnswer.trim().toLowerCase(),
    user.securityAnswer,
  );

  if (!isValidAnswer) {
    throw ERR.incorrectSecurityAnswer();
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw ERR.samePassword();
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.passwordHash = hashedPassword;
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Password reset successfully",
  });
});
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ERR.refreshTokenRequired();
  }

  let decoded;

  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw ERR.refreshTokenInvalid();
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw ERR.refreshTokenInvalid();
  }

  if (user.refreshToken !== refreshToken) {
    throw ERR.invalidRefreshToken();
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

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    data: {
      accessToken,
    },
  });
});
const logout = asyncHandler(async (req, res) => {
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
