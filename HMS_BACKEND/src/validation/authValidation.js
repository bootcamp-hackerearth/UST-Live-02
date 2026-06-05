const { body } = require("express-validator");

//  VALIDATION FOR SIGNUP
const signupValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .toLowerCase()
    .isEmail()
    .withMessage("Valid email required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage('Password must have atleast one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must have atleast one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must have atleast one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must have atleast one special character'),

  body("designation")
    .isIn([
      "OWNER",
      "DOCTOR",
      "NURSE",
      "RECEPTIONIST",
      "CASHIER",
      "LAB_TECH",
      "PHARMACIST",
      "ADMIN"
    ])
    .withMessage("Role mismatch"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must have atleast 3 characters.")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name must only contain letters and spaces"),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Enter a valid 10-digit mobile number"),

  body("department")
    .notEmpty()
    .withMessage('Department is required.')
    .toUpperCase()
    .isIn([
      "OPD",
      "IPD",
      "LAB",
      "PHARMACY",
      "ADMIN"
    ])
    .withMessage("Dept mismatch"),

  body("joiningDate")
    .notEmpty()
    .withMessage('Joining date is required.')
    .isDate()
    .withMessage("proper Date Fromat required"),

  body('specialization')
    .optional()
    .isString()
    .withMessage('Specialization must be a string.'),

  body('qualification')
    .notEmpty()
    .isArray({ min: 1 })
    .withMessage('Qualification is required.'),

  body("medicalRegistrationNumber").custom((value, { req }) => {
    if (["DOCTOR", "NURSE", "LAB_TECH", "PHARMACIST"].includes(req.body.designation) && !value) {
      throw new Error("Medical registration number is required for this role");
    }

    if (!["DOCTOR", "NURSE", "LAB_TECH", "PHARMACIST"].includes(req.body.designation) && value) {
      throw new Error("Medical registration number is available only for medical-based roles");
    }

    if (value && typeof value !== "string") {
      throw new Error("Medical registration number must be a string");
    }

    return true;
  })
];

// VALIDATION FOR LOGIN
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage('valid email required'),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

module.exports = { signupValidation, loginValidation };