const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");
const ERR = require("../../utils/errors");

const findUser = async (loginId) => {
  if (loginId.includes("@")) {
    return User.findOne({
      email: loginId.toLowerCase(),
    });
  }

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

const validateLinkedAccount = async (user) => {
  if (user.employeeId) {
    const employee = await Employee.findOne({
      _id: user.employeeId,
      isDeleted: { $ne: true },
    });

    if (!employee) {
      throw ERR.invalidCredentials();
    }
  }

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

const validateUserStatus = (user) => {
  switch (user.status) {
    case "PENDING":
      throw ERR.accountPendingApproval();

    case "REJECTED":
      throw ERR.registrationRejected();

    case "INACTIVE":
      throw ERR.accountInactive();

    default:
      return;
  }
};

const validatePassword = async (user, password) => {
  const hash = user.isFirstLogin
    ? user.temporaryPasswordHash
    : user.passwordHash;

  const isPasswordValid = await bcrypt.compare(password, hash);

  if (!isPasswordValid) {
    throw ERR.invalidCredentials();
  }
};

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;

  const user = await findUser(loginId);

  if (!user) {
    throw ERR.invalidCredentials();
  }

  await validateLinkedAccount(user);

  validateUserStatus(user);

  await validatePassword(user, password);

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