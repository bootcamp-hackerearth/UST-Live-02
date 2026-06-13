const Patient = require("../../models/Patient");
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const generatePatientId = require("../../utils/generatePatientId");
const sendEmail = require("../../utils/sendEmail");

const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8); // simple temp password
};

const emptyToUndefined = (value) => {
  return value === "" ? undefined : value;
};

const registerPatient = async (patientData) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    bloodGroup,
    maritalStatus,

    phone,
    email,
    address,
    city,
    state,
    pincode,
    country,

    emergencyContactName,
    emergencyContactPhone,
    relationship,

    allergies,
    chronicDiseases,
    currentMedications,
    pastSurgeries,
    medicalHistory,
    familyMedicalHistory,

    insuranceProvider,
    insurancePolicyNumber,
    insuranceExpiryDate,
    insuranceCoverageAmount,

    assignedDoctor,
    department,
    patientType,
  } = patientData;

  // -------------------------
  // CHECK EXISTING USER
  // -------------------------
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const existingPatient = await Patient.findOne({ phone });

  if (existingPatient) {
    throw new Error("Phone number already registered");
  }

  // -------------------------
  // GENERATE TEMP PASSWORD
  // -------------------------
  const tempPassword = generateRandomPassword();
  const hashedTempPassword = await bcrypt.hash(tempPassword, 10);

  // -------------------------
  // CREATE USER
  // -------------------------
  const patientId = await generatePatientId();

  const user = await User.create({
    email,

    passwordHash: null,
    temporaryPasswordHash: hashedTempPassword,

    roles: ["PATIENT"],
    patientId,
    status: "ACTIVE",
    isFirstLogin: true,
  });

  // -------------------------
  // CREATE PATIENT
  // -------------------------
  const patient = await Patient.create({
    patientId,
    userId: user._id,

    firstName,
    lastName,
    dateOfBirth,
    gender,
    bloodGroup,
    maritalStatus,

    phone,
    email,
    address,
    city,
    state,
    pincode,
    country,

    emergencyContactName,
    emergencyContactPhone,
    relationship,

    allergies,
    chronicDiseases,
    currentMedications,
    pastSurgeries,
    medicalHistory,
    familyMedicalHistory,

    insuranceProvider,
    insurancePolicyNumber,
    insuranceExpiryDate: emptyToUndefined(insuranceExpiryDate),
    insuranceCoverageAmount: emptyToUndefined(insuranceCoverageAmount),

    assignedDoctor,
    department,
    patientType,

  });

  // -------------------------
  // SEND EMAIL WITH TEMP PASSWORD
  // -------------------------
  await sendEmail({
    to: email,
    subject: "Your Hospital Account Credentials",

    htmlContent: `
    <h2>Welcome ${firstName}</h2>

    <p>Your patient account has been created.</p>

    <p><b>Email:</b> ${email}</p>

    <p><b>Temporary Password:</b> ${tempPassword}</p>

    <p style="color:red;">
      Please login and change your password immediately.
    </p>

    <br/>
    <p>Thank you,<br/>Hospital Management System</p>
  `,
  });
  return {
    message: "Patient registered successfully and email sent",
    patient,
  };
};

module.exports = registerPatient;
