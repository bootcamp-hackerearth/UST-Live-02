const { body, query } = require("express-validator");

const APPOINTMENT_TYPES = [
  "CONSULTATION",
  "FOLLOW_UP",
  "EMERGENCY",
  "VIDEO_CONSULTATION",
  "ROUTINE_CHECKUP",
];

const PRIORITIES = ["NORMAL", "URGENT", "CRITICAL"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "INSURANCE"];
const VISIT_MODES = ["OFFLINE", "ONLINE", "HOME_VISIT"];
const APPOINTMENT_STATUSES = [
  "PENDING",
  "BOOKED",
  "REJECTED",
  "CANCELLED",
  "COMPLETED",
  "IN_CONSULTATION",
  "NO_SHOW",
];

const isFutureOrToday = (value) => {
  const selectedDate = new Date(value);
  const today = new Date();

  selectedDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new Error("Appointment date cannot be in the past");
  }

  return true;
};

const optionalString = (field, max = 500) =>
  body(field)
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max })
    .withMessage(`${field} cannot exceed ${max} characters`);

const symptomsValidation = body("symptoms")
  .optional()
  .isArray()
  .withMessage("Symptoms must be an array")
  .custom((symptoms) =>
    symptoms.every(
      (symptom) =>
        typeof symptom === "string" &&
        symptom.trim().length <= 200
    )
  )
  .withMessage("Each symptom must be text up to 200 characters")
  .customSanitizer((symptoms) =>
    Array.isArray(symptoms)
      ? symptoms.map((symptom) => symptom.trim()).filter(Boolean)
      : symptoms
  );

const appointmentFieldsValidation = [
  body("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Invalid doctor ID"),

  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(isFutureOrToday),

  body("appointmentTime")
    .trim()
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Appointment time must be in HH:mm format"),

  body("appointmentType")
    .optional({ values: "falsy" })
    .isIn(APPOINTMENT_TYPES)
    .withMessage("Invalid appointment type"),

  body("priority")
    .optional({ values: "falsy" })
    .isIn(PRIORITIES)
    .withMessage("Invalid appointment priority"),

  body("paymentStatus")
    .optional({ values: "falsy" })
    .isIn(PAYMENT_STATUSES)
    .withMessage("Invalid payment status"),

  body("visitMode")
    .optional({ values: "falsy" })
    .isIn(VISIT_MODES)
    .withMessage("Invalid visit mode"),

  optionalString("reason"),
  optionalString("notes", 1000),
  symptomsValidation,
];

const bookAppointmentValidation = [
  body("patientId")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isMongoId()
    .withMessage("Invalid patient ID"),
  ...appointmentFieldsValidation,
];

const bookPatientAppointmentValidation = appointmentFieldsValidation;

const updateMyAppointmentValidation = [
  body("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(isFutureOrToday),

  body("appointmentTime")
    .trim()
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Appointment time must be in HH:mm format"),

  symptomsValidation,
];

const updateAppointmentValidation = [
  body("doctorEmployeeId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Invalid doctor ID"),

  body("appointmentDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Invalid appointment date")
    .custom(isFutureOrToday),

  body("timeSlot")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Time slot must be in HH:mm format"),

  body("appointmentType")
    .optional({ values: "falsy" })
    .isIn(APPOINTMENT_TYPES)
    .withMessage("Invalid appointment type"),

  body("priority")
    .optional({ values: "falsy" })
    .isIn(PRIORITIES)
    .withMessage("Invalid appointment priority"),

  body("paymentStatus")
    .optional({ values: "falsy" })
    .isIn(PAYMENT_STATUSES)
    .withMessage("Invalid payment status"),

  body("visitMode")
    .optional({ values: "falsy" })
    .isIn(VISIT_MODES)
    .withMessage("Invalid visit mode"),

  body("status")
    .optional({ values: "falsy" })
    .isIn(APPOINTMENT_STATUSES)
    .withMessage("Invalid appointment status"),

  optionalString("reason"),
  optionalString("notes", 1000),
  symptomsValidation,
];

const availableSlotsValidation = [
  query("doctorId")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isMongoId()
    .withMessage("Invalid doctor ID"),

  query("appointmentDate")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid appointment date"),
];

module.exports = {
  bookAppointmentValidation,
  bookPatientAppointmentValidation,
  updateAppointmentValidation,
  updateMyAppointmentValidation,
  availableSlotsValidation,
};
