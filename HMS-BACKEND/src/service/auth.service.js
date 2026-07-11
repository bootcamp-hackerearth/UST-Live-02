const User = require("../models/User.model");

const bcrypt = require("bcrypt");
const sendEmail = require('./mail.service');
const {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
} = require("../utils/jwt");

const ApiError = require("../utils/ApiError");

exports.loginEmployee = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).populate("roleId");

  if (!user) {
    throw new ApiError(404, "Employee Not Found");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "This account is inactive");
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


exports.forgotPassword = async (email) => {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  });

  // Always return success to prevent email enumeration
  if (!user) {
    return;
  }

  const token = generatePasswordResetToken({
    userId: user._id,
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6;">
      <h2>Password Reset Request</h2>
 
      <p>Hello ${user.firstName},</p>
 
      <p>
        We received a request to reset your password.
      </p>
 
      <p>
        Click the button below to create a new password.
      </p>
 
      <a
        href="${resetLink}"
        style="
          display:inline-block;
          padding:10px 20px;
          background:#185FA5;
          color:#fff;
          text-decoration:none;
          border-radius:5px;
        "
      >
        Reset Password
      </a>
 
      <p style="margin-top:20px;">
        Or copy this link into your browser:
      </p>
 
      <p>${resetLink}</p>
 
      <p>
        This link will expire in 15 minutes.
      </p>
 
      <p>
        If you did not request this password reset, you can safely ignore this email.
      </p>
 
      <br>
 
      <p>
        Hospital Management System
      </p>
    </div>
  `;

  await sendEmail(normalizedEmail, "Reset your HMS password", html);
};

exports.resetPassword = async (token, newPassword) => {
  const decoded = verifyPasswordResetToken(token);

  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

  if (isSamePassword) {
    throw new ApiError(
      400,
      "New password cannot be the same as the current password",
    );
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);

  user.mustChangePassword = false;

  await user.save();

  return {
    email: user.email,
  };
};
