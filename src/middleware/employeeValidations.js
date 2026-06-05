const { body } = require("express-validator");
const Employee = require("../models/Employee");
const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .trim().isEmail().withMessage("Valid email required"),

  body("role")
    .isIn(["OWNER",  "ADMIN", "TECHNICIAN" ,  "DOCTOR", "RECEPTIONIST", "CASHIER" , "NURSE", "LAB_TECH" , "PHARMACIST" ])
    .withMessage("Invalid role"),

  body("phone")
    .notEmpty()
    .withMessage("Phone is required")
    .isNumeric()
    .withMessage("Phone number must contain only numbers")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits")
    .custom((value) => {
    if (value.startsWith("0")) {
      throw new Error("Phone number should not start with 0");
    }
    return true;
  }),

  body("department")
    .notEmpty()
    .withMessage("valid department required"),

  body("designation")
    .trim()
    .notEmpty().withMessage("Designation is required"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  
  body("medicalRegistrationNo")
    .if(body("role").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Medical registration number is required")
    .custom(async (value) => {
    const existing = await Employee.findOne({ medicalRegistrationNo: value });
    if (existing) {
      throw new Error("Medical registration number already exists");
    }
    return true;
  }),


  body("specialization")
    .if(body("role").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Specialization is required"),

  body("qualification")
    .if(body("role").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Qualification is required"),

  body("consultationFee")
    .if(body("role").equals("DOCTOR"))
    .notEmpty()
    .withMessage("Consultation fee is required for doctor")
    .isNumeric()
    .withMessage("Consultation fee must be a number"),

  body("availabilitySlots")
    .optional()
    .isArray()
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];
 

module.exports = {
  signupValidation,
  loginValidation
};
