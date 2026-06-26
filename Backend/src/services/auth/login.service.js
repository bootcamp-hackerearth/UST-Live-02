const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const generateAccessToken = require("../../utils/generateAccessToken");
const generateRefreshToken = require("../../utils/generateRefreshToken");
const ERR = require("../../utils/errors");

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;

  let user = null;

  // login using email or employee code
  const isEmailLogin = loginId.includes("@");

  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
    });
  } else {
    const employee = await Employee.findOne({
      employeeCode: loginId,
      isDeleted: { $ne: true },
    });

    if (!employee) {
throw ERR.invalidCredentials();    }

    user = await User.findOne({
      employeeId: employee._id,
    });
  }

  // Validate user account
  if (!user) {
throw ERR.invalidCredentials();  }

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

  //  account status
 if (user.status === "PENDING") {
throw ERR.accountPendingApproval();}

if (user.status === "REJECTED") {
throw ERR.registrationRejected();}

if (user.status === "INACTIVE") {
throw ERR.accountInactive();}

  let isPasswordValid = false;

  // Validate password based on login stage
  if (user.isFirstLogin) {
    isPasswordValid = await bcrypt.compare(
      password,
      user.temporaryPasswordHash,
    );
  } else {
    isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  }

  // Reject invalid password
  if (!isPasswordValid) {
throw ERR.invalidCredentials();  }

  // Generate JWT token
  const tokenPayload = {
    userId: user._id,
    employeeId: user.employeeId,
    patientId: user.patientId,
    roles: user.roles,
  };

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

