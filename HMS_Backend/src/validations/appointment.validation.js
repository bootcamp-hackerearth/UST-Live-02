const { body } = require("express-validator");
const STATUS = require("../constants/status");

const appointmentTypes = [
  "CONSULTATION",
  "FOLLOW_UP",
  "EMERGENCY",
  "VIDEO_CONSULTATION",
  "ROUTINE_CHECKUP",
];
const priorities = ["NORMAL", "URGENT", "CRITICAL"];
const paymentStatuses = ["PENDING", "PAID", "INSURANCE"];
const visitModes = ["OFFLINE", "ONLINE", "HOME_VISIT"];
const appointmentStatuses = [
  STATUS.PENDING,
  STATUS.BOOKED,
  STATUS.REJECTED,
  STATUS.CANCELLED,
  STATUS.COMPLETED,
  STATUS.IN_CONSULTATION,
  STATUS.NO_SHOW,
];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const requiredMongoId = (field, label) =>
  body(field).notEmpty().withMessage(`${label} is required`).isMongoId().withMessage(`Valid ${label} is required`);

const optionalText = (field, label, max = 500) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max })
    .withMessage(`${label} cannot exceed ${max} characters`);

const optionalSymptoms = [
  body("symptoms")
    .optional({ checkFalsy: true })
    .isArray({ max: 20 })
    .withMessage("Symptoms must be a list with at most 20 items"),
  body("symptoms.*")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Each symptom must be between 2 and 100 characters"),
];

const appointmentDetailsValidation = [
  body("appointmentType").optional({ checkFalsy: true }).isIn(appointmentTypes).withMessage("Invalid appointment type"),
  body("priority").optional({ checkFalsy: true }).isIn(priorities).withMessage("Invalid priority"),
  body("paymentStatus").optional({ checkFalsy: true }).isIn(paymentStatuses).withMessage("Invalid payment status"),
  body("visitMode").optional({ checkFalsy: true }).isIn(visitModes).withMessage("Invalid visit mode"),
  optionalText("reason", "Reason"),
  optionalText("notes", "Notes"),
  ...optionalSymptoms,
];

const bookAppointmentValidation = [
  requiredMongoId("patientId", "patient"),
  requiredMongoId("doctorId", "doctor"),
  body("appointmentDate").notEmpty().withMessage("Appointment date is required").isISO8601().withMessage("Invalid appointment date"),
  body("appointmentTime").notEmpty().withMessage("Appointment time is required").matches(timePattern).withMessage("Appointment time must be HH:mm"),
  ...appointmentDetailsValidation,
];

const bookPatientAppointmentValidation = [
  requiredMongoId("doctorId", "doctor"),
  body("appointmentDate").notEmpty().withMessage("Appointment date is required").isISO8601().withMessage("Invalid appointment date"),
  body("appointmentTime").notEmpty().withMessage("Appointment time is required").matches(timePattern).withMessage("Appointment time must be HH:mm"),
  ...optionalSymptoms,
];

const updateAppointmentValidation = [
  body("doctorEmployeeId").optional({ checkFalsy: true }).isMongoId().withMessage("Valid doctor is required"),
  body("appointmentDate").optional({ checkFalsy: true }).isISO8601().withMessage("Invalid appointment date"),
  body("timeSlot").optional({ checkFalsy: true }).matches(timePattern).withMessage("Time slot must be HH:mm"),
  body("status").optional({ checkFalsy: true }).isIn(appointmentStatuses).withMessage("Invalid appointment status"),
  ...appointmentDetailsValidation,
];

const updateMyAppointmentValidation = [
  body("appointmentDate").notEmpty().withMessage("Appointment date is required").isISO8601().withMessage("Invalid appointment date"),
  body("appointmentTime").notEmpty().withMessage("Appointment time is required").matches(timePattern).withMessage("Appointment time must be HH:mm"),
  ...optionalSymptoms,
];

module.exports = {
  bookAppointmentValidation,
  bookPatientAppointmentValidation,
  updateAppointmentValidation,
  updateMyAppointmentValidation,
};
