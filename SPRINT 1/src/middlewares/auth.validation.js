const { body } = require("express-validator");

const signupValidation = [
  body("email").isEmail().withMessage("enter a valid email"),
  body("password").isLength({ min: 8 }).withMessage("min 8 characters"),
  body("firstName").notEmpty().withMessage("first name required"),
  body("lastName").notEmpty().withMessage("last name required"),
  body("phone").isMobilePhone().withMessage("phone number required"),
  body("availabilityStartTime")
    .notEmpty()
    .withMessage("Availability start time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Availability start time must be in HH:mm 24-hour format"),

  body("availabilityEndTime")
    .notEmpty()
    .withMessage("Availability end time is required")
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage("Availability end time must be in HH:mm 24-hour format"),
];

module.exports = { signupValidation };
