const { body, param } = require("express-validator");

// Validates fields for medical record creation
const createMedicalRecordValidation = [
    body("appointmentId")
        .trim()
        .notEmpty()
        .withMessage("Appointment id is required"),

    body("symptoms")
        .trim()
        .notEmpty()
        .withMessage("Symptoms are required"),

    body("diagnosis")
        .trim()
        .notEmpty()
        .withMessage("Diagnosis is required"),

    body("prescriptionItems")
        .optional()
        .isArray()
        .withMessage("Prescription items must be an array"),

    body("prescriptionItems.*.name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prescription item name is required"),

    body("prescriptionItems.*.dosage")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prescription item dosage is required"),

    body("prescriptionItems.*.duration")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prescription item duration is required"),

    body("notes")
        .optional()
        .trim(),

    body("status")
        .optional()
        .isIn(["DRAFT", "FINALIZED"])
        .withMessage("Status must be DRAFT or FINALIZED")
];

// Validates fields for medical record update (partial; finalize allowed for doctor)
const updateMedicalRecordValidation = [
    param("medicalRecordId")
        .notEmpty()
        .withMessage("Medical record id is required"),

    body("symptoms")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Symptoms cannot be empty"),

    body("diagnosis")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Diagnosis cannot be empty"),

    body("prescriptionItems")
        .optional()
        .isArray()
        .withMessage("Prescription items must be an array"),

    body("prescriptionItems.*.name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prescription item name is required"),

    body("prescriptionItems.*.dosage")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prescription item dosage is required"),

    body("prescriptionItems.*.duration")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Prescription item duration is required"),

    body("notes")
        .optional()
        .trim(),

    body("status")
        .optional()
        .isIn(["DRAFT", "FINALIZED"])
        .withMessage("Status must be DRAFT or FINALIZED")
];

// Validates the medicalRecordId URL parameter
const medicalRecordIdValidation = [
    param("medicalRecordId")
        .notEmpty()
        .withMessage("Medical record id is required")
];

// Validates the appointmentId URL parameter
const appointmentIdParamValidation = [
    param("appointmentId")
        .notEmpty()
        .withMessage("Appointment id is required")
];

module.exports = {
    createMedicalRecordValidation,
    updateMedicalRecordValidation,
    medicalRecordIdValidation,
    appointmentIdParamValidation
};
