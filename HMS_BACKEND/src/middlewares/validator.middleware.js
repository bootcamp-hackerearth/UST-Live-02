const { body } = require("express-validator");

const userSignUpValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits"),
];
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
    .withMessage("Start time must be in HH:mm  24-hour format"),

  body("availabilityEndTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("End time must be in HH:mm  24-hour format"),

  body("experienceYears")
    .notEmpty()
    .withMessage("Experience is required")
    .isInt({ min: 0, max: 60 })
    .withMessage("Experience must be between 0 and 60 years"),
];
const employeeValidator = [
  body("department").notEmpty().withMessage("Department is required"),

  body("designation").notEmpty().withMessage("Designation is required"),
];
module.exports = {
  userSignUpValidator,
  doctorValidator,
  employeeValidator,
};
