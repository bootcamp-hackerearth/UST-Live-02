const { body } = require("express-validator");
const EMPLOYEE_PREFIX = require("../constants/employee-prefix");

const employeeDesignations = Object.keys(EMPLOYEE_PREFIX);
const genders = ["MALE", "FEMALE", "OTHER"];

const nameValidation = (field = "name") =>
  body(field)
    .trim()
    .notEmpty()
    .withMessage("Employee name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Employee name can contain only alphabets and spaces");

const phoneValidation = (field = "phone") =>
  body(field)
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits");

const optionalPhoneValidation = (field = "phone") =>
  body(field)
    .optional({ checkFalsy: true })
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits");

const departmentValidation = (required = true) => {
  const chain = body("department").trim();

  if (!required) {
    return chain
      .optional({ checkFalsy: true })
      .isLength({ min: 2, max: 100 })
      .withMessage("Department must be between 2 and 100 characters");
  }

  return chain
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters");
};

const doctorFieldValidation = [
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
  body("qualification.*")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Each qualification must be between 2 and 100 characters")
    .matches(/^[A-Za-z0-9\s.,()-]+$/)
    .withMessage("Qualification contains invalid characters"),
  body("specialization")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Specialization is too long"),
  body("consultationFee")
    .optional({ values: "falsy" })
    .isNumeric()
    .withMessage("Consultation fee must be a number")
    .custom((value) => value >= 0)
    .withMessage("Consultation fee cannot be negative"),
];

const registerEmployeeValidation = [
  nameValidation(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  phoneValidation(),
  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(genders)
    .withMessage("Invalid gender"),
  departmentValidation(),
  body("designation")
    .trim()
    .notEmpty()
    .withMessage("Designation is required")
    .isIn(employeeDesignations)
    .withMessage("Invalid employee designation"),
  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid joining date format"),
  ...doctorFieldValidation,
];

const updateEmployeeValidation = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Employee name can contain only alphabets and spaces"),
  optionalPhoneValidation(),
  body("gender")
    .optional({ checkFalsy: true })
    .isIn(genders)
    .withMessage("Invalid gender"),
  departmentValidation(false),
  body("designation")
    .optional({ checkFalsy: true })
    .isIn(employeeDesignations)
    .withMessage("Invalid employee designation"),
  body("joiningDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid joining date format"),
  ...doctorFieldValidation,
];

module.exports = { registerEmployeeValidation, updateEmployeeValidation };
