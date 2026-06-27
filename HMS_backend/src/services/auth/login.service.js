const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");
const ERR = require("../../utils/errors");

const findUserByEmail = (loginId) =>
  User.findOne({
    email: loginId.toLowerCase(),
  });

const findUserByEmployeeCode = async (loginId) => {
  const employee = await Employee.findOne({
    employeeCode: loginId,
    isDeleted: { $ne: true },
  });

  if (!employee) {
    throw ERR.invalidCredentials();
  }

  return User.findOne({
    employeeId: employee._id,
  });
};

const findUserByLoginId = (loginId) =>
  loginId.includes("@")
    ? findUserByEmail(loginId)
    : findUserByEmployeeCode(loginId);

const ensureUserExists = (user) => {
  if (!user) {
    throw ERR.invalidCredentials();
  }
};

const validateLinkedEmployee = async (user) => {
  if (user.employeeId) {
    const employee = await Employee.findOne({
      _id: user.employeeId,
      isDeleted: { $ne: true },
    });

    if (!employee) {
      throw ERR.invalidCredentials();
    }
  }
};

const validateLinkedPatient = async (user) => {
  if (user.patientId) {
    const patient = await Patient.findOne({
      _id: user.patientId,
      isDeleted: { $ne: true },
    });

    if (!patient) {
      throw ERR.invalidCredentials();
    }
  }
};

const validateLinkedAccount = async (user) => {
  await validateLinkedEmployee(user);
  await validateLinkedPatient(user);
};

const statusErrorMap = {
  PENDING: ERR.accountPendingApproval,
  REJECTED: ERR.registrationRejected,
  INACTIVE: ERR.accountInactive,
};

const validateAccountStatus = (status) => {
  const createError = statusErrorMap[status];

  if (createError) {
    throw createError();
  }
};

const getPasswordHash = (user) =>
  user.isFirstLogin ? user.temporaryPasswordHash : user.passwordHash;

const validatePassword = async (user, password) => {
  const isPasswordValid = await bcrypt.compare(password, getPasswordHash(user));

  if (!isPasswordValid) {
    throw ERR.invalidCredentials();
  }
};

const buildTokenPayload = (user) => ({
  userId: user._id,
  employeeId: user.employeeId,
  patientId: user.patientId,
  roles: user.roles,
});

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;
  const user = await findUserByLoginId(loginId);

  ensureUserExists(user);
  await validateLinkedAccount(user);
  validateAccountStatus(user.status);
  await validatePassword(user, password);

  // Generate JWT token
  const tokenPayload = buildTokenPayload(user);

  const accessToken = generateAccessToken(tokenPayload);

  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token in DB
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

