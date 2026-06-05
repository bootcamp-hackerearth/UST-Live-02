const { body } = require("express-validator");

const doctorValidator = [
  body("specialization").notEmpty().withMessage("Specialization is required"),

  body("qualification").notEmpty().withMessage("Qualification is required"),

  body("consultationFee")
    .notEmpty()
    .withMessage("Consultation fee is required")
    .isFloat({ min: 0 })
    .withMessage("Consultation fee must be a positive number"),

  body("medicalRegistrationNo")
    .notEmpty()
    .withMessage("Medical registration number is required")
    .isLength({ min: 5, max: 50 })
    .withMessage(
      "Medical registration number must be between 5 and 50 characters",
    ),

  body("availabilityStartTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Start time must be in HH:mm format"),

  body("availabilityEndTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm format"),

  body("experienceYears")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 0, max: 60 })
    .withMessage("Experience must be between 0 and 60 years"),
];
const employeeValidator = [
  body("department")
    .notEmpty()
    .withMessage("Department is required")
    .isIn(["OPD", "IPD", "LAB", "PHARMACY", "ADMIN"])
    .withMessage("Department must be one of: OPD, IPD, LAB, PHARMACY, ADMIN"),

  body("designation").notEmpty().withMessage("Designation is required"),
];
const signupValidation = [
  body("email").isEmail().withMessage("enter a valid email"),
  body("password").isLength({ min: 8 }).withMessage("min 8 characters"),
  body("firstName").notEmpty().withMessage("first name required"),
  body("lastName").notEmpty().withMessage("last name required"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits"),
];
module.exports = {
  signupValidation,
  doctorValidator,
  employeeValidator,
};
