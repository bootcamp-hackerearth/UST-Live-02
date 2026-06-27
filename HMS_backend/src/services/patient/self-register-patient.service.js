const bcrypt = require("bcryptjs");

const Patient = require("../../models/Patient");
const User = require("../../models/User");

const ROLES = require("../../constants/roles");
const STATUS = require("../../constants/status");

const createPatientWithGeneratedId = require("../../utils/createPatientWithGeneratedId");
const ERR = require("../../utils/errors");
const selfRegisterPatient = async (patientData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    securityQuestion,
    securityAnswer,
  } = patientData;

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw ERR.emailAlreadyRegistered();
  }

  const existingPatient = await Patient.findOne({
    phone,
  });

  if (existingPatient) {
    throw ERR.phoneAlreadyRegistered();
  }

  const patient = await createPatientWithGeneratedId({
    firstName,

    lastName,

    email,

    phone,

    gender: "OTHER",

    dateOfBirth: new Date(),
  });

  const passwordHash = await bcrypt.hash(password, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10,
  );

  await User.create({
    email: email.toLowerCase(),

    passwordHash,

    patientId: patient._id,

    roles: [ROLES.PATIENT],

    isFirstLogin: false,

    status: STATUS.ACTIVE,

    securityQuestion,

    securityAnswer: hashedSecurityAnswer,
  });

  return {
    message: "Patient registered successfully",
    patient,
  };
};

module.exports = selfRegisterPatient;
