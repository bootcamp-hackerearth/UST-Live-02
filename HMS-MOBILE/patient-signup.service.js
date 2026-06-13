const Patient = require("../../models/Patient");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");

const generatePatientId = require("../../utils/generatePatientId");

const patientSignup = async (patientData) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    email,
    password,
    address,
    city,
    state,
    pincode,
    country,
    bloodGroup,
    maritalStatus,
    emergencyContactName,
    emergencyContactPhone,
    relationship,
  } = patientData;

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userDoc = new User({
    firstName,
    lastName,
    email,
    phone,
    passwordHash: hashedPassword,
    roles: ["PATIENT"],
    status: "ACTIVE",
    isFirstLogin: false,
  });

  const user = await userDoc.save();

  if (!user) throw new Error("Failed to create user account");

  const patientId = await generatePatientId();

  const patient = await Patient.create({
    userId: user._id,
    patientId,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    email,
    address,
    city,
    state,
    pincode,
    country,
    bloodGroup,
    maritalStatus,
    emergencyContactName,
    emergencyContactPhone,
    relationship,
  });

  return {
    userId: user._id,
    patientId: patient.patientId,
    patient,
  };
};

module.exports = patientSignup;