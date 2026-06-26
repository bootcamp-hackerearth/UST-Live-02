const User = require("../models/User.model");

const bcrypt = require("bcrypt");

const {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

const ApiError = require("../utils/ApiError");

exports.loginEmployee = async ({ email, password }) => {
  const user = await User.findOne({ email }).populate("roleId");

  if (!user) {
    throw new ApiError(404, "Employee Not Found");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid Credentials");
  }

  if (!user.isVerified) {
    throw new ApiError(401, "Please verify your mail before login");
  }

  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.roleId.name,
    rolecode: user.roleId.roleCode,
    basePath: user.roleId.basePath,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
  });

  //this login token contains the user id and role id as the payload for the jwt token
  user.lastLoginAt = new Date();

  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      status: user.status,
      mustChangePassword: user.mustChangePassword,
    },
  };
};

exports.verifyEmployeeEmail = async (token) => {
  const decoded = verifyToken(token);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  user.isVerified = true;
  await user.save();

  return {
    email: user.email,
    isVerified: user.isVerified,
    message: "Employee Email Verified successfully",
  };
};

exports.changePassword = async (userId, { oldPassword, newPassword }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isOldPasswordMatch = await bcrypt.compare(
    oldPassword,
    user.passwordHash,
  );

  if (!isOldPasswordMatch) {
    throw new ApiError(401, "Old password is incorrect");
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  user.passwordHash = newPasswordHash;
  user.mustChangePassword = false;

  await user.save();

  return {
    email: user.email,
    mustChangePassword: user.mustChangePassword,
  };
};

exports.refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);

  const user = await User.findById(decoded.userId).populate("roleId");

  if (!user.isVerified) {
    throw new ApiError(401, "User is not verified");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(401, "User account is inactive");
  }

  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.roleId.name,
    rolecode: user.roleId.roleCode,
    basePath: user.roleId.basePath,
  });

  return {
    accessToken,
  };
};


exports.changeFirstLoginPassword = async (
  userId,
  newPassword
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  if (!user.mustChangePassword) {
    throw new ApiError(
      400,
      "First-login password change is not required"
    );
  }

  const isTemporaryPasswordReused =
    await bcrypt.compare(
      newPassword,
      user.passwordHash
    );

  if (isTemporaryPasswordReused) {
    throw new ApiError(
      400,
      "New password cannot be the same as the temporary password"
    );
  }

  user.passwordHash =
    await bcrypt.hash(newPassword, 10);

  user.mustChangePassword = false;

  await user.save();

  return {
    email: user.email,
    mustChangePassword:
      user.mustChangePassword,
  };
};