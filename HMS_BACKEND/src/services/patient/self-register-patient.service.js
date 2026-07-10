const bcrypt = require("bcryptjs");

const Patient = require("../../models/Patient");

const User = require("../../models/User");

const ROLES = require("../../constants/roles");

const STATUS = require("../../constants/status");

const generatePatientId = require("../../utils/generatePatientId");
const ApiError = require("../../utils/ApiError");

const selfRegisterPatient = async (patientData) => {
  const { firstName, lastName, email, phone, password } = patientData;

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "Email already registered",
      "EMAIL_ALREADY_REGISTERED",
    );
  }

  const existingPatient = await Patient.findOne({
    phone,
    isDeleted: false,
  });

  if (existingPatient) {
    throw new ApiError(
      409,
      "Phone number already registered",
      "PHONE_ALREADY_REGISTERED",
    );
  }

  const patientId = await generatePatientId();

  const patient = await Patient.create({
    patientId,
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone,
    gender: "OTHER",
    dateOfBirth: new Date(),
    status: STATUS.ACTIVE,
    createdBy: null,
  });

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    email: email.toLowerCase(),
    passwordHash,
    patientId: patient._id,
    roles: [ROLES.PATIENT],
    isFirstLogin: false,
    status: STATUS.ACTIVE,
  });

  return {
    message: "Patient registered successfully",
    patient,
  };
};

module.exports = selfRegisterPatient;
