const Patient = require("../../models/Patient");

const generatePatientId = require("../../utils/generatePatientId");
const bcrypt = require("bcryptjs");

const User = require("../../models/User");

const ROLES = require("../../constants/roles");

const STATUS = require("../../constants/status");
const sendEmail = require("../../utils/sendEmail");
const patientCreatedTemplate = require("../../templates/patient-created.template");
const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
const ERR = require("../../utils/errors");
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
    taluk,
    postOffice,
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
throw ERR.futureDateOfBirth();  }

  // check duplicate
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
throw ERR.userEmailExists();  }

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
    taluk,
    postOffice,
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
