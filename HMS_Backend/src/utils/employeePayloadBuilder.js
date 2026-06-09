const normalizeQualifications = require("./qualificationNormalizer");
const { MEDICAL_DESIGNATIONS_SET, SPECIALIZATION_DESIGNATIONS_SET } = require("../config/constants");

const buildEmployeePayload = (data) => {
  const {
    name,
    phone,
    email,
    department,
    designation,
    joiningDate,
    qualification,
    medicalRegistrationNumber,
    specialization,
    consultationFee,
    availabilitySlots,
  } = data;

  const employeeData = {
    name,
    phone,
    email,
    department,
    designation,
    joiningDate,
    qualification: normalizeQualifications(qualification),
  };

  if (MEDICAL_DESIGNATIONS_SET.has(designation)) {
    employeeData.medicalRegistrationNumber = medicalRegistrationNumber;
  }

  if (SPECIALIZATION_DESIGNATIONS_SET.has(designation)) {
    employeeData.specialization = specialization;
  }

  if (designation === "DOCTOR") {
    employeeData.consultationFee = consultationFee;
    employeeData.availabilitySlots = availabilitySlots?.map((slot) => ({
      ...slot,
      day: slot.day.toUpperCase(),
    }));
  }

  return employeeData;
};

module.exports = buildEmployeePayload;