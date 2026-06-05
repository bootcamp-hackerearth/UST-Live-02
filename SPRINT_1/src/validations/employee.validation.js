const { body } = require("express-validator");
const ROLES = require("../constants/roles");

const registerEmployeeValidation = [
  body("name")
    .notEmpty()
    .withMessage("Employee name is required")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Name should contain only alphabets and spaces"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

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

  body("department").notEmpty().withMessage("Department is required"),
  body("designation").notEmpty().withMessage("Designation is required"),
  body("joiningDate").notEmpty().withMessage("Joining date is required"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(Object.values(ROLES))
    .withMessage("Invalid employee role"),
];
module.exports = { registerEmployeeValidation };
