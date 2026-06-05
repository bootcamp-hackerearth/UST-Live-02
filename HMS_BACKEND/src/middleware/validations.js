const { body } = require("express-validator");
const adminSignupValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("roles")
    .notEmpty()
    .withMessage("Role is required")
    .isIn([
      "OWNER",
      "ADMIN",
      "DOCTOR",
      "RECEPTIONIST",
      "CASHIER",
      "NURSE",
      "LAB_TECH",
      "PHARMACIST",
      "TECHNICIAN",
    ])
    .withMessage("Invalid role"),
  body("employeeData.name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),
  body("employeeData.phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isNumeric()
    .withMessage("Phone number must contain only numbers")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 9 or 10 digits")
    .custom((value) => {
      if (value.startsWith("0")) {
        throw new Error("Phone number should not start with 0");
      }
      return true;
    }),
  body("employeeData.email")
    .trim()
    .isEmail()
    .withMessage("Valid employee email is required"),
  body("employeeData.email")
    .trim()
    .isEmail()
    .withMessage("Valid employee email is required")
    .custom((value, { req }) => {
      if (value !== req.body.email) {
        throw new Error("Email and Employee Email should match");
      }
      return true;
    }),
  body("employeeData.department")
    .trim()
    .notEmpty()
    .withMessage("Department is required"),
  body("employeeData.designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required"),
  body("employeeData.joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid date format"),
  body("employeeData.medicalRegistrationNumber")
    .if(body("roles").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Medical registration number is required"),
  body("employeeData.specialization")
    .if(body("roles").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Specialization is required"),
  body("employeeData.qualification")
    .if(body("roles").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Qualification is required"),
  body("employeeData.consultationFee")
    .if(body("roles").equals("DOCTOR"))
    .isNumeric()
    .withMessage("Consultation fee must be a number"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

module.exports = {
  adminSignupValidation,
  loginValidation,
};
