const bcrypt = require("bcryptjs");

const Patient = require("../../models/Patient");
const User = require("../../models/User");

const ROLES = require("../../constants/roles");
const STATUS = require("../../constants/status");

const generatePatientId = require("../../utils/generatePatientId");

const selfRegisterPatient = async (patientData) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = patientData;

  /*
  |--------------------------------------------------------------------------
  | Duplicate Email Check
  |--------------------------------------------------------------------------
  */
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  /*
  |--------------------------------------------------------------------------
  | Duplicate Phone Check
  |--------------------------------------------------------------------------
  */
  const existingPatient = await Patient.findOne({
    phone,
  });

  if (existingPatient) {
    throw new Error("Phone number already registered");
  }

  /*
  |--------------------------------------------------------------------------
  | Generate Patient ID
  |--------------------------------------------------------------------------
  */
  const patientId = await generatePatientId();

  /*
  |--------------------------------------------------------------------------
  | Create Patient
  |--------------------------------------------------------------------------
  */
  const patient = await Patient.create({
    patientId,

    firstName,

    lastName,

    email,

    phone,

    gender: "OTHER",

    dateOfBirth: new Date(),
  });

  /*
  |--------------------------------------------------------------------------
  | Hash Password
  |--------------------------------------------------------------------------
  */
  const passwordHash = await bcrypt.hash(
    password,
    10,
  );

  /*
  |--------------------------------------------------------------------------
  | Create User
  |--------------------------------------------------------------------------
  */
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