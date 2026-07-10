const { body } = require("express-validator");
const EMPLOYEE_PREFIX = require("../constants/employee-prefix");

const employeeDesignations = Object.keys(EMPLOYEE_PREFIX);
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const workingDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

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

const updateEmployeeValidation = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters")
    .matches(/^[A-Za-z\s]+$/)
    .withMessage("Employee name can contain only alphabets and spaces"),
  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be exactly 10 digits"),
  body("gender")
    .optional({ checkFalsy: true })
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),
  body("department")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Department must be between 2 and 100 characters"),
  body("designation")
    .optional({ checkFalsy: true })
    .isIn(employeeDesignations)
    .withMessage("Invalid employee designation"),
  body("joiningDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid joining date format"),
  body("consultationFee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Consultation fee cannot be negative"),
  body("medicalRegistrationNo")
    .optional({ values: "falsy" })
    .isLength({ min: 5, max: 50 })
    .withMessage("Medical registration number must be between 5 and 50 characters")
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

const doctorAvailabilityValidation = [
  body("workingDays").isArray({ min: 1 }).withMessage("Select at least one working day"),
  body("workingDays.*").isIn(workingDays).withMessage("Invalid working day"),
  body("startTime").notEmpty().withMessage("Start time is required").matches(timePattern).withMessage("Start time must be HH:mm"),
  body("endTime")
    .notEmpty()
    .withMessage("End time is required")
    .matches(timePattern)
    .withMessage("End time must be HH:mm")
    .custom((endTime, { req }) => {
      if (req.body.startTime && endTime <= req.body.startTime) {
        throw new Error("End time must be after start time");
      }

      return true;
    }),
  body("slotDuration").isInt({ min: 5, max: 240 }).withMessage("Slot duration must be between 5 and 240 minutes"),
  body("breakStartTime").optional({ checkFalsy: true }).matches(timePattern).withMessage("Break start time must be HH:mm"),
  body("breakEndTime")
    .optional({ checkFalsy: true })
    .matches(timePattern)
    .withMessage("Break end time must be HH:mm")
    .custom((breakEndTime, { req }) => {
      const { breakStartTime, startTime, endTime } = req.body;

      if (!breakStartTime && breakEndTime) {
        throw new Error("Break start time is required when break end time is provided");
      }

      if (breakStartTime && breakEndTime <= breakStartTime) {
        throw new Error("Break end time must be after break start time");
      }

      if (breakStartTime && startTime && breakStartTime < startTime) {
        throw new Error("Break time must be inside working hours");
      }

      if (breakEndTime && endTime && breakEndTime > endTime) {
        throw new Error("Break time must be inside working hours");
      }

      return true;
    }),
  body("maxPatientsPerDay").isInt({ min: 1, max: 500 }).withMessage("Max patients per day must be between 1 and 500"),
  body("isAvailable").optional().isBoolean().withMessage("Availability status must be true or false"),
];

module.exports = {
  registerEmployeeValidation,
  updateEmployeeValidation,
  doctorAvailabilityValidation,
};
