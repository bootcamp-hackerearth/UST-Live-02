const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Employee = require("../../models/Employee");
const generateToken = require("../../utils/generateToken");

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;

  if (!loginId || !password) {
    throw new Error("Login ID and password are required");
  }

  let user = null;

  const isEmailLogin = loginId.includes("@");

  // -------------------------
  // FIND USER
  // -------------------------
  if (isEmailLogin) {
    user = await User.findOne({ email: loginId.toLowerCase() });
  } else {
    const employee = await Employee.findOne({ employeeCode: loginId });

    if (!employee) {
      throw new Error("Invalid credentials");
    }

    user = await User.findOne({ employeeId: employee._id });
  }

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // -------------------------
  // STATUS CHECK
  // -------------------------
  if (user.status === "PENDING") {
    throw new Error("Your account is pending admin approval");
  }

  if (user.status === "REJECTED") {
    throw new Error("Your registration was rejected");
  }

  if (user.status === "INACTIVE") {
    throw new Error("Account is inactive");
  }

  // -------------------------
  // PASSWORD PICKING LOGIC (FIXED)
  // -------------------------
  let storedPassword = null;

  if (user.isFirstLogin) {
    storedPassword = user.temporaryPasswordHash; // admin created
  } else {
    storedPassword = user.passwordHash; // normal user
  }

  if (!storedPassword) {
    throw new Error("Password not configured. Contact Admin.");
  }

  const isPasswordValid = await bcrypt.compare(password, storedPassword);

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  // -------------------------
  // TOKEN
  // -------------------------
  console.log("LOGIN RESPONSE USER:", user.roles);

  const roles = user.roles || [];

  console.log("TOKEN PAYLOAD ROLES:", roles);
  const tokenPayload = {
    userId: user._id,
    email: user.email,
    employeeId: user.employeeId || null,
    patientId: user.patientId || null,
    roles,
  };

  const token = generateToken(tokenPayload);

  user.lastLoginAt = new Date();
  await user.save();

  return {
    token,
    user,
  };
};

module.exports = loginUser;
