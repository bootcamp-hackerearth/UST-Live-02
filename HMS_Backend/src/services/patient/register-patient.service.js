const Patient = require("../../models/Patient");

const generatePatientId = require("../../utils/generatePatientId");

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
  });

  return {
    message: "Patient registered successfully",
    patient,
  };
};

module.exports = registerPatient;