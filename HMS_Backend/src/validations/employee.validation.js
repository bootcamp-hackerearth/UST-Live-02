const { body } = require("express-validator");
const ROLES = require("../constants/roles");

const registerEmployeeValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Employee name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Employee name can contain only alphabets and spaces"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  body("department")
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),

  body("designation").trim().notEmpty().withMessage("Designation is required"),

  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid joining date format"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Invalid employee role"),

  body("consultationFee")
    .optional()
    .isNumeric()
    .withMessage("Consultation fee must be a number")
    .custom((value) => value >= 0)
    .withMessage("Consultation fee cannot be negative"),

  body("medicalRegistrationNo")
    .optional({ values: "falsy" })
    .isLength({
      min: 5,
      max: 50,
    })
    .withMessage(
      "Medical registration number must be between 5 and 50 characters",
    )
    .matches(/^[A-Za-z0-9\-/]+$/)
    .withMessage("Medical registration number contains invalid characters"),
  body("qualification")
    .optional({ values: "falsy" })
    .isArray()
    .withMessage("Qualification must be an array"),

  body("specialization")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Specialization is too long"),
];

module.exports = { registerEmployeeValidation };
