const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const generateToken = require("../../utils/generateToken");

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;

  if (!loginId || !password) {
    throw new Error("Login ID and password are required");
  }

  let user = null;

  const isEmailLogin = loginId.includes("@");

  // FIND USER
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

  const roles = user.roles || [];
  const isPatient = roles.includes("PATIENT");

  // STATUS CHECK
  if (user.status === "PENDING" && !isPatient) {
    throw new Error("Your account is pending admin approval");
  }

  if (user.status === "REJECTED") {
    throw new Error("Your registration was rejected");
  }

  if (user.status === "INACTIVE") {
    throw new Error("Account is inactive");
  }

  // PASSWORD 
  let storedPassword = null;

  if (user.isFirstLogin && user.temporaryPasswordHash) {
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

  if (isPatient && user.isFirstLogin && user.temporaryPasswordHash && !user.passwordHash) {
    user.lastLoginAt = new Date();
    await user.save();

    return {
      requiresPasswordReset: true,
      email: user.email,
      message: "Temporary password verified. Please reset your password.",
    };
  }

  if (isPatient && user.passwordHash) {
    user.status = "ACTIVE";
    user.isFirstLogin = false;
  }

  let patient = null;

  if (isPatient) {
    patient = await Patient.findOne({
      $or: [
        { userId: user._id },
        { user: user._id },
        { patientId: user.patientId },
        { email: user.email },
      ],
    });

    if (patient) {
      let shouldSavePatient = false;

      if (!patient.userId) {
        patient.userId = user._id;
        shouldSavePatient = true;
      }

      if (!patient.user) {
        patient.user = user._id;
        shouldSavePatient = true;
      }

      if (shouldSavePatient) {
        await patient.save();
      }

      if (!user.patientId && patient.patientId) {
        user.patientId = patient.patientId;
      }
    }
  }

  // TOKEN
  console.log("LOGIN RESPONSE USER:", user.roles);

  console.log("TOKEN PAYLOAD ROLES:", roles);
  const tokenPayload = {
    userId: user._id,
    email: user.email,
    employeeId: user.employeeId || null,
    patientId: user.patientId || null,
    patientObjectId: patient?._id || null,
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
