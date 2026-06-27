const { body } = require("express-validator");

const optionalTrimmedText = (field, max = 1000) =>
  body(field)
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max })
    .withMessage(`${field} cannot exceed ${max} characters`);

const createConsultationValidation = [
  body("appointmentId")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isMongoId()
    .withMessage("Invalid appointment ID"),

  body("diagnosis")
    .trim()
    .notEmpty()
    .withMessage("Diagnosis is required")
    .isLength({ min: 2, max: 1000 })
    .withMessage("Diagnosis must be between 2 and 1000 characters"),

  body("symptoms")
    .optional()
    .isArray()
    .withMessage("Symptoms must be an array")
    .custom((symptoms) =>
      symptoms.every(
        (symptom) =>
          typeof symptom === "string" &&
          symptom.trim().length <= 200
      )
    )
    .withMessage("Each symptom must be text up to 200 characters")
    .customSanitizer((symptoms) =>
      Array.isArray(symptoms)
        ? symptoms.map((symptom) => symptom.trim()).filter(Boolean)
        : symptoms
    ),

  optionalTrimmedText("doctorNotes", 2000),

  body("vitals.bloodPressure")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^\d{2,3}\/\d{2,3}$/)
    .withMessage("Blood pressure must be in systolic/diastolic format"),

  body("vitals.pulseRate")
    .optional({ values: "falsy" })
    .isFloat({ min: 20, max: 250 })
    .withMessage("Pulse rate must be between 20 and 250"),

  body("vitals.oxygenLevel")
    .optional({ values: "falsy" })
    .isFloat({ min: 0, max: 100 })
    .withMessage("Oxygen level must be between 0 and 100"),

  body("vitals.temperature")
    .optional({ values: "falsy" })
    .isFloat({ min: 30, max: 45 })
    .withMessage("Temperature must be between 30 and 45 Celsius"),

  body("vitals.weight")
    .optional({ values: "falsy" })
    .isFloat({ min: 0.5, max: 500 })
    .withMessage("Weight must be between 0.5 and 500"),

  body("prescriptions")
    .isArray({ min: 1 })
    .withMessage("At least one prescription is required"),

  body("prescriptions.*.medicineName")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required")
    .isLength({ max: 100 })
    .withMessage("Medicine name cannot exceed 100 characters"),

  body("prescriptions.*.dosage")
    .trim()
    .notEmpty()
    .withMessage("Dosage is required")
    .isLength({ max: 100 })
    .withMessage("Dosage cannot exceed 100 characters"),

  body("prescriptions.*.frequency")
    .trim()
    .notEmpty()
    .withMessage("Frequency is required")
    .isLength({ max: 100 })
    .withMessage("Frequency cannot exceed 100 characters"),

  body("prescriptions.*.duration")
    .trim()
    .notEmpty()
    .withMessage("Duration is required")
    .isLength({ max: 100 })
    .withMessage("Duration cannot exceed 100 characters"),
];

module.exports = {
  createConsultationValidation,
};
