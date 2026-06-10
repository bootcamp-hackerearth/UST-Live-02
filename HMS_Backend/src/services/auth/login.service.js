const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const generateToken = require("../../utils/generateToken");

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;

  let user = null;

  // Allow login using email or employee code
  const isEmailLogin = loginId.includes("@");

  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
    });
  } else {
    const employee = await Employee.findOne({
      employeeCode: loginId,
    });

    if (!employee) {
      throw new Error("Invalid credentials");
    }

    user = await User.findOne({
      employeeId: employee._id,
    });
  }

  // Validate user account
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check account status
  if (user.status === "PENDING") {
    throw new Error("Your account is pending admin approval");
  }

  if (user.status === "REJECTED") {
    throw new Error("Your registration was rejected");
  }

  if (user.status === "INACTIVE") {
    throw new Error("Account is inactive");
  }

  let isPasswordValid = false;

  // Validate password based on login stage
  if (user.isFirstLogin) {
    isPasswordValid = await bcrypt.compare(
      password,
      user.temporaryPasswordHash
    );
  } else {
    isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash
    );
  }

  // Reject invalid password
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT token
  const tokenPayload = {
    userId: user._id,
    employeeId: user.employeeId,
    roles: user.roles,
  };

  const token = generateToken(tokenPayload);

  // Update last login timestamp
  user.lastLoginAt = new Date();

  await user.save();

  return {
    token,
    user,
  };
};

module.exports = loginUser;