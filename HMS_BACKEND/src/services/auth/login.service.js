const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");
const ROLES = require("../../constants/roles");
const ApiError = require("../../utils/ApiError");

const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");

const loginUser = async (loginData, clientType) => {
  const { loginId, password } = loginData;

  let user = null;

  const isEmailLogin = loginId.includes("@");

  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
      isDeleted: false,
    });
  } else {
    const employee = await Employee.findOne({
      employeeCode: loginId,
      isDeleted: false,
    });

    if (!employee) {
      throw new ApiError(401, "Invalid credentials", "UNAUTHORIZED");
    }

    user = await User.findOne({
      employeeId: employee._id,
      isDeleted: false,
    });
  }

  if (!user) {
    throw new ApiError(401, "Invalid credentials", "UNAUTHORIZED");
  }

  if (user.status === STATUS.PENDING) {
    throw new ApiError(
      403,
      "Your account is pending admin approval",
      "FORBIDDEN",
    );
  }

  if (user.status === STATUS.REJECTED) {
    throw new ApiError(403, "Your registration was rejected", "FORBIDDEN");
  }

  if (user.status === STATUS.INACTIVE) {
    throw new ApiError(403, "Account is inactive", "FORBIDDEN");
  }

  let isPasswordValid = false;

  if (user.isFirstLogin) {
    isPasswordValid = await bcrypt.compare(
      password,
      user.temporaryPasswordHash,
    );
  } else {
    isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  }

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials", "UNAUTHORIZED");
  }

  if (clientType === "mobile" && !user.roles.includes(ROLES.PATIENT)) {
    throw new ApiError(403, "Access denied. Mobile app is for patients only.", "FORBIDDEN");
  }

  const tokenPayload = {
    userId: user._id,
    employeeId: user.employeeId,
    patientId: user.patientId,
    roles: user.roles,
  };

  const accessToken = generateAccessToken(tokenPayload);

  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  user.lastLoginAt = new Date();

  await user.save();

  return {
    accessToken,
    refreshToken,
    user,
  };
};

module.exports = loginUser;
