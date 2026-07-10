const { body } = require("express-validator");

// Reusable name regex
const patientNameRegex = /^[A-Za-z]+$/;
const nameRegex = /^[A-Za-z\s'-]+$/;
const locationNameRegex = /^[A-Za-z\s'().&-]+$/;
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["MALE", "FEMALE", "OTHER"];
const maritalStatuses = ["SINGLE", "MARRIED", "DIVORCED"];
const patientTypes = ["OPD", "IPD", "EMERGENCY"];
const patientStatuses = ["ACTIVE", "DISCHARGED", "INACTIVE"];

const rejectFutureDate = (message) => (value) => {
  if (new Date(value) > new Date()) {
    throw new Error(message);
  }

  return true;
};

const requiredName = (field, label) =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .matches(patientNameRegex)
    .withMessage(
      `${label} can contain only letters`,
    );

const optionalPatientName = (field, label, min = 2, max = 50) =>
  body(field)
    .optional()
    .trim()
    .matches(patientNameRegex)
    .withMessage(`${label} can contain only letters`)
    .isLength({ min, max })
    .withMessage(`${label} must be between ${min} and ${max} characters`);

const optionalName = (field, label, min = 2, max = 100) =>
  body(field)
    .optional()
    .trim()
    .matches(nameRegex)
    .withMessage(
      `${label} can contain only letters`,
    )
    .isLength({ min, max })
    .withMessage(`${label} must be between ${min} and ${max} characters`);

const optionalEnum = (field, allowedValues, message) =>
  body(field).optional().isIn(allowedValues).withMessage(message);

const optionalPhone = (field, message) =>
  body(field).optional().matches(/^\d{10}$/).withMessage(message);

const optionalIsoDate = (field, message) =>
  body(field).optional({ checkFalsy: true }).isISO8601().withMessage(message);

// Validation for creating a patient
const createPatientValidation = [
  requiredName("firstName", "First name"),
  requiredName("lastName", "Last name"),
  body("dateOfBirth")
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601()
    .withMessage("Invalid date of birth")
    .custom(rejectFutureDate("Date of birth cannot be in the future")),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(genders)
    .withMessage("Invalid gender"),
  optionalEnum("bloodGroup", bloodGroups, "Invalid blood group"),
  optionalEnum("maritalStatus", maritalStatuses, "Invalid marital status"),
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
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email address"),
  body("address")
    .optional()
    .trim()
    .isLength({
      min: 5,
      max: 250,
    })
    .withMessage("Address must be between 5 and 250 characters"),
  body("city")
    .optional()
    .trim()
    .matches(locationNameRegex)
    .withMessage(
      "City can contain only letters, spaces, apostrophes, hyphens, periods, ampersands and parentheses",
    )
    .isLength({ max: 100 })
    .withMessage("City cannot exceed 100 characters"),
  body("state")
    .optional()
    .trim()
    .matches(locationNameRegex)
    .withMessage(
      "State can contain only letters, spaces, apostrophes, hyphens, periods, ampersands and parentheses",
    )
    .isLength({ max: 100 })
    .withMessage("State cannot exceed 100 characters"),
  body("taluk")
    .optional()
    .trim()
    .matches(locationNameRegex)
    .withMessage(
      "Taluk can contain only letters, spaces, apostrophes, hyphens, periods, ampersands and parentheses",
    )
    .isLength({ max: 100 })
    .withMessage("Taluk cannot exceed 100 characters"),
  body("postOffice")
    .optional()
    .trim()
    .matches(locationNameRegex)
    .withMessage(
      "Post office can contain only letters, spaces, apostrophes, hyphens, periods, ampersands and parentheses",
    )
    .isLength({ max: 100 })
    .withMessage("Post office cannot exceed 100 characters"),
  body("pincode")
    .optional()
    .matches(/^\d{6}$/)
    .withMessage("Pincode must be 6 digits"),
  body("country")
    .optional()
    .trim()
    .matches(nameRegex)
    .withMessage(
      "Country can contain only letters",
    )
    .isLength({ max: 100 })
    .withMessage("Country cannot exceed 100 characters"),
  optionalName("emergencyContactName", "Emergency contact name"),
  optionalPhone(
    "emergencyContactPhone",
    "Emergency contact phone must be exactly 10 digits",
  ),
  optionalName("relationship", "Relationship", 2, 50),
  body("insuranceCoverageAmount")
    .optional({ checkFalsy: true })
    .isFloat({
      min: 0,
    })
    .withMessage("Insurance coverage amount must be positive"),
  optionalIsoDate("insuranceExpiryDate", "Invalid insurance expiry date"),
  optionalEnum("patientType", patientTypes, "Invalid patient type"),
  optionalEnum("status", patientStatuses, "Invalid patient status"),
];

// Validation for updating a patient
const updatePatientValidation = [
  optionalPatientName("firstName", "First name", 2, 50),
  optionalPatientName("lastName", "Last name", 2, 50),
  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date of birth")
    .custom(rejectFutureDate("Date of birth cannot be in the future")),
  optionalEnum("gender", genders, "Invalid gender"),
  optionalEnum("bloodGroup", bloodGroups, "Invalid blood group"),
  optionalEnum("maritalStatus", maritalStatuses, "Invalid marital status"),
  optionalPhone("phone", "Phone number must be exactly 10 digits"),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email address"),
  body("pincode").optional().matches(/^\d{6}$/).withMessage("Pincode must be 6 digits"),
  optionalPhone(
    "emergencyContactPhone",
    "Emergency contact phone must be exactly 10 digits",
  ),
  body("insuranceCoverageAmount")
    .optional({ checkFalsy: true })
    .isNumeric()
    .withMessage("Insurance coverage amount must be numeric"),
  optionalIsoDate("insuranceExpiryDate", "Invalid insurance expiry date"),
  optionalEnum("patientType", patientTypes, "Invalid patient type"),
  optionalEnum("status", patientStatuses, "Invalid patient status"),
];

module.exports = {
  createPatientValidation,
  updatePatientValidation,
};
