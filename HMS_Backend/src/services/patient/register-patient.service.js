const Patient = require("../../models/Patient");

const generatePatientId = require("../../utils/generatePatientId");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

const ROLES = require("../../constants/roles");

const STATUS = require("../../constants/status");
const sendEmail = require("../../utils/sendEmail");
const patientCreatedTemplate = require("../../templates/patient-created.template");
const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
const ApiError = require("../../utils/ApiError");
const registerPatient = async (patientData) => {
  const {
    // Basic information
    firstName,
    lastName,
    dateOfBirth,
    gender,
    bloodGroup,
    maritalStatus,

    // Contact information
    phone,
    email,
    address,
    city,
    state,
    pincode,
    country,

    // Emergency contact
    emergencyContactName,
    emergencyContactPhone,
    relationship,

    // Medical information
    allergies,
    chronicDiseases,
    currentMedications,
    pastSurgeries,
    medicalHistory,
    familyMedicalHistory,

    // Insurance information
    insuranceProvider,
    insurancePolicyNumber,
    insuranceExpiryDate,
    insuranceCoverageAmount,

    // Hospital information
    assignedDoctor,
    department,
    patientType,
  } = patientData;

  // Generate unique patient ID
  const patientId = await generatePatientId();
  if (dateOfBirth && new Date(dateOfBirth) > new Date()) {
    throw new ApiError(
      422,
      "Date of Birth cannot be in the future",
      "INVALID_DATE_OF_BIRTH",
    );
  }

  // check duplicate
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this email already exists",
      "EMAIL_ALREADY_EXISTS",
    );
  }

  // Create patient record
  const patient = await Patient.create({
    patientId,

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
    createdBy: null,
  });

  const temporaryPassword = generateTemporaryPassword();
  const temporaryPasswordHash = await bcrypt.hash(temporaryPassword, 10);

  await User.create({
    email: email.toLowerCase(),

    temporaryPasswordHash,

    patientId: patient._id,

    roles: [ROLES.PATIENT],

    isFirstLogin: true,

    status: STATUS.ACTIVE,
  });
  if (patient.email) {
    const htmlContent = patientCreatedTemplate({
      patientName: `${patient.firstName} ${patient.lastName}`,

      email: patient.email,

      temporaryPassword,
    });

    await sendEmail({
      to: patient.email,

      subject: "Your HMS Account Credentials",

      htmlContent,
    });
  }

  return {
    message: "Patient registered successfully",
    patient,
  };
};

module.exports = registerPatient;
