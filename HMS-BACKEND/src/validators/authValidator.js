const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const signupValidation = [
  body("email").trim().isEmail().withMessage("Valid email required"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase and number"),

  body("role")
    .isIn([
      "OWNER",
      "ADMIN",
      "DOCTOR",
      "RECEPTIONIST",
      "CASHIER",
      "NURSE",
      "LAB_TECH",
      "PHARMACIST",
    ])
    .withMessage("Role mismatch"),

  body("phone")
    .matches(/^[6-9]\d{9}$/)
    .withMessage("Phone number should be 10 digits"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Name should contain only alphabets"),

  body("joiningDate")
  .isISO8601()
  .withMessage("Valid joining date required")
  .custom((value) => {
    if (new Date(value) > new Date()) {
      throw new Error("Joining date cannot be in future");
    }
    return true;
  }),

  body("department")
    .isIn(["OPD", "IPD", "Lab", "Pharmacy", "Admin"])
    .withMessage("Invalid Department"),

  body("medicalRegistrationNumber").custom((value, { req }) => {
    if (
      ["DOCTOR", "NURSE", "LAB_TECH", "PHARMACIST"].includes(req.body.role) &&
      !value
    ) {
      throw new Error("Medical registration number is required for this role");
    }

    if (
      !["DOCTOR", "NURSE", "LAB_TECH", "PHARMACIST"].includes(req.body.role) &&
      value
    ) {
      throw new Error(
        "Medical registration number is available only for medical-based roles",
      );
    }

    if (value && typeof value !== "string") {
      throw new Error("Medical registration number must be a string");
    }

    return true;
  }),

  body("qualification")
    .isArray({ min: 1 })
    .withMessage("At least one qualification required"),

  body("qualification.*")
    .notEmpty()
    .withMessage("Qualification cannot be empty"),

  body("consultationFee").custom((value, { req }) => {
    if (
      req.body.role === "DOCTOR" &&
      (value === undefined || value === null || value === "")
    ) {
      throw new Error("Consultation fee required for doctor");
    }

    if (req.body.role !== "DOCTOR" && value) {
      throw new Error("Consultation fee allowed only for doctor");
    }

    if (value && Number.isNaN(value)) {
      throw new Error("Consultation fee must be numeric");
    }

    return true;
  }),
];

const loginValidation = [
  body("email")
  .trim()
  .isEmail().withMessage("Valid email required"),
  body("password")
  .trim()
  .notEmpty().withMessage("Password is required"),
];
module.exports = { signupValidation, loginValidation };