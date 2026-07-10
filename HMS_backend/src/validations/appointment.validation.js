const { body, query } = require("express-validator");
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

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const rejectPastDate = (value) => {
  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new Error("Appointment date cannot be in the past");
  }

  return true;
};

const optionalText = (field, label, max = 500) =>
  body(field)
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max })
    .withMessage(`${label} cannot exceed ${max} characters`);

const symptomsValidation = body("symptoms")
  .optional({ checkFalsy: true })
  .customSanitizer((value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  })
  .isArray()
  .withMessage("Symptoms must be a list")
  .bail()
  .custom((value) => value.every((item) => typeof item === "string" && item.length <= 120))
  .withMessage("Each symptom cannot exceed 120 characters");

const createAppointmentValidation = [
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(rejectPastDate),
  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(timeRegex)
    .withMessage("Appointment time must be in HH:mm format"),
  body("appointmentType")
    .notEmpty()
    .withMessage("Appointment type is required")
    .isIn(appointmentTypes)
    .withMessage("Invalid appointment type"),
  body("priority")
    .notEmpty()
    .withMessage("Priority is required")
    .isIn(priorities)
    .withMessage("Invalid priority"),
  body("paymentStatus")
    .notEmpty()
    .withMessage("Payment status is required")
    .isIn(paymentStatuses)
    .withMessage("Invalid payment status"),
  body("visitMode")
    .notEmpty()
    .withMessage("Visit mode is required")
    .isIn(visitModes)
    .withMessage("Invalid visit mode"),
  symptomsValidation,
  optionalText("reason", "Reason"),
  optionalText("notes", "Notes"),
];

const updateAppointmentValidation = [
  body("appointmentDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(rejectPastDate),
  body("timeSlot")
    .optional({ checkFalsy: true })
    .matches(timeRegex)
    .withMessage("Time slot must be in HH:mm format"),
  body("appointmentType")
    .optional({ checkFalsy: true })
    .isIn(appointmentTypes)
    .withMessage("Invalid appointment type"),
  body("priority")
    .optional({ checkFalsy: true })
    .isIn(priorities)
    .withMessage("Invalid priority"),
  body("paymentStatus")
    .optional({ checkFalsy: true })
    .isIn(paymentStatuses)
    .withMessage("Invalid payment status"),
  body("visitMode")
    .optional({ checkFalsy: true })
    .isIn(visitModes)
    .withMessage("Invalid visit mode"),
  body("status")
    .optional({ checkFalsy: true })
    .isIn(appointmentStatuses)
    .withMessage("Invalid appointment status"),
  symptomsValidation,
  optionalText("reason", "Reason"),
  optionalText("notes", "Notes"),
];

const updateMyAppointmentValidation = [
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(rejectPastDate),
  body("appointmentTime")
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(timeRegex)
    .withMessage("Appointment time must be in HH:mm format"),
  symptomsValidation,
];

const getAvailableSlotsValidation = [
  query("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(rejectPastDate),
];

module.exports = {
  createAppointmentValidation,
  updateAppointmentValidation,
  updateMyAppointmentValidation,
  getAvailableSlotsValidation,
};
