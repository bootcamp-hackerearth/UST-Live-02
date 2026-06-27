const Patient = require("../models/Patient");
const generatePatientId = require("./generatePatientId");

const MAX_CREATE_ATTEMPTS = 5;
const PATIENT_IDENTIFIER_FIELDS = new Set(["patientId", "UHID"]);

const getDuplicateField = (error) =>
  Object.keys(error?.keyPattern || error?.keyValue || {})[0];

const isPatientIdentifierDuplicate = (error) =>
  error?.code === 11000 &&
  PATIENT_IDENTIFIER_FIELDS.has(getDuplicateField(error));

const createPatientWithGeneratedId = async (patientData) => {
  for (let attempt = 1; attempt <= MAX_CREATE_ATTEMPTS; attempt += 1) {
    const patientId = await generatePatientId();

    try {
      return await Patient.create({
        ...patientData,
        patientId,
        UHID: patientId,
      });
    } catch (error) {
      const canRetry =
        isPatientIdentifierDuplicate(error) && attempt < MAX_CREATE_ATTEMPTS;

      if (!canRetry) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create patient with a unique patient ID");
};

module.exports = createPatientWithGeneratedId;
