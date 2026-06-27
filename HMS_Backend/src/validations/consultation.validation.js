const { body } = require("express-validator");

const prescriptionValidation = (path) => [
  body(`${path}.*.medicineName`)
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required"),

  body(`${path}.*.dosage`).trim().notEmpty().withMessage("Dosage is required"),

  body(`${path}.*.frequency`)
    .trim()
    .notEmpty()
    .withMessage("Frequency is required"),

  body(`${path}.*.duration`)
    .trim()
    .notEmpty()
    .withMessage("Duration is required"),
];

const vitalsValidation = [
  body("vitals.bloodPressure")
    .optional({ checkFalsy: true })
    .matches(/^\d{2,3}\/\d{2,3}$/)
    .withMessage("Blood pressure must be in 120/80 format"),

  body("vitals.pulseRate")
    .optional({ checkFalsy: true })
    .isFloat({ min: 1, max: 250 })
    .withMessage("Pulse rate must be between 1 and 250"),

  body("vitals.oxygenLevel")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("Oxygen level must be between 0 and 100"),

  body("vitals.temperature")
    .optional({ checkFalsy: true })
    .isFloat({ min: 30, max: 45 })
    .withMessage("Temperature must be between 30 and 45 Celsius"),

  body("vitals.weight")
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 500 })
    .withMessage("Weight must be between 0 and 500 kg"),
];

const createConsultationValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Invalid appointment ID"),

  body("diagnosis").trim().notEmpty().withMessage("Diagnosis is required"),

  body("symptoms").optional().isArray().withMessage("Symptoms must be an array"),

  body("prescriptions")
    .isArray({ min: 1 })
    .withMessage("At least one prescription is required"),

  ...prescriptionValidation("prescriptions"),
  ...vitalsValidation,
];

const updateConsultationValidation = [
  body("diagnosis")
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty()
    .withMessage("Diagnosis cannot be empty"),

  body("symptoms").optional().isArray().withMessage("Symptoms must be an array"),

  body("prescriptions")
    .optional()
    .isArray({ min: 1 })
    .withMessage("At least one prescription is required"),

  ...prescriptionValidation("prescriptions"),
  ...vitalsValidation,
];

module.exports = {
  createConsultationValidation,
  updateConsultationValidation,
};
