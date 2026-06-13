const { body } = require("express-validator");

// Validation for creating a patient
const createPatientValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .matches(/^[A-Za-z\s'-]+$/)
    .withMessage(
      "First name can contain only letters, spaces, apostrophes and hyphens"
    ),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .matches(/^[A-Za-z\s'-]+$/)
    .withMessage(
      "Last name can contain only letters, spaces, apostrophes and hyphens"
    ),

  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date of birth"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  body("bloodGroup")
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood group"),

  body("maritalStatus")
    .optional()
    .isIn(["SINGLE", "MARRIED", "DIVORCED"])
    .withMessage("Invalid marital status"),

  body("countryCode")
    .optional()
    .matches(/^\+\d{1,4}$/)
    .withMessage("Invalid country code"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email address"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Address cannot exceed 250 characters"),

  body("city")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),

  body("state")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),

  body("pincode")
    .optional()
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be 6 digits"),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),

  body("emergencyContactName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Emergency contact name must be between 2 and 100 characters"
    ),

  body("emergencyContactPhone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Emergency contact phone must be exactly 10 digits"),

  body("relationship")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Relationship must be between 2 and 50 characters"),

  body("insuranceCoverageAmount")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Insurance coverage amount must be numeric"),

  body("insuranceExpiryDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid insurance expiry date"),

  body("patientType")
    .optional()
    .isIn(["OPD", "IPD", "EMERGENCY"])
    .withMessage("Invalid patient type"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "DISCHARGED", "INACTIVE"])
    .withMessage("Invalid patient status"),
];

// Validation for updating a patient
const updatePatientValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth"),

  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  body("bloodGroup")
    .optional()
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Invalid blood group"),

  body("maritalStatus")
    .optional()
    .isIn(["SINGLE", "MARRIED", "DIVORCED"])
    .withMessage("Invalid marital status"),

  body("phone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email address"),

  body("pincode")
    .optional()
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be 6 digits"),

  body("emergencyContactPhone")
    .optional()
    .matches(/^\d{10}$/)
    .withMessage("Emergency contact phone must be exactly 10 digits"),

  body("insuranceCoverageAmount")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Insurance coverage amount must be numeric"),

  body("insuranceExpiryDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid insurance expiry date"),

  body("patientType")
    .optional()
    .isIn(["OPD", "IPD", "EMERGENCY"])
    .withMessage("Invalid patient type"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "DISCHARGED", "INACTIVE"])
    .withMessage("Invalid patient status"),
];

module.exports = {
  createPatientValidation,
  updatePatientValidation,
};