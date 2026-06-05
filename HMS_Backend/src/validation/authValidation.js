const { body } = require("express-validator");

const DAY_VALUES   = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const TIME_REGEX   = /^([01]\d|2[0-3]):[0-5]\d$/;
const DESIGNATIONS = ["OWNER", "DOCTOR", "NURSE", "RECEPTIONIST", "CASHIER", "LAB_TECH", "PHARMACIST", "ADMIN"];
const DEPARTMENTS  = ["OPD", "IPD", "LAB", "PHARMACY", "ADMIN"];

const MEDICAL_REG_ROLES    = ["DOCTOR", "NURSE", "PHARMACIST"];
const SPECIALISATION_ROLES = ["DOCTOR", "LAB_TECH"];
const DOCTOR_ONLY_ROLES    = ["DOCTOR"];


const coreFields = [
  body("email")
    .trim()
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/).withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain at least one special character"),

  body("name")
  .trim()
  .notEmpty().withMessage("Name is required")
  .matches(/^[a-zA-Z\s.'-]+$/)
  .withMessage("Name must contain only letters, spaces, dots, hyphens, or apostrophes"),

  body("designation")
    .notEmpty().withMessage("Designation is required")
    .isIn(DESIGNATIONS).withMessage("Designation mismatch"),

  body("department")
    .notEmpty().withMessage("Department is required")
    .isIn(DEPARTMENTS).withMessage("Department mismatch"),

  body("phone")
    .notEmpty().withMessage("Phone number is required")
    .trim()
    .matches(/^\d{10}$/).withMessage("Phone number must be exactly 10 digits"),

  body("joiningDate")
    .notEmpty().withMessage("Joining date is required")
    .isISO8601().withMessage("Proper date format is required"),
];



const qualificationFields = [
  body("qualification")
    .isArray({ min: 1 }).withMessage("At least one qualification is required"),

  body("qualification.*")
    .trim()
    .notEmpty().withMessage("Qualification entries cannot be empty"),
];



const crossFieldRules = [

  body("medicalRegistrationNumber")
    .if(body("designation").isIn(MEDICAL_REG_ROLES))
    .notEmpty()
    .withMessage(`Medical registration number is required for: ${MEDICAL_REG_ROLES.join(", ")}`),

  body("medicalRegistrationNumber")
    .if(body("designation").not().isIn(MEDICAL_REG_ROLES))
    .custom((value) => {
      if (value !== undefined && value !== null) {
        throw new Error(`Medical registration number is only applicable for: ${MEDICAL_REG_ROLES.join(", ")}`);
      }
      return true;
    }),

  // ── specialisation ─────────────────────────────────────────────────────────
  body("specialisation")
    .if(body("designation").isIn(SPECIALISATION_ROLES))
    .notEmpty()
    .withMessage(`Specialisation is required for: ${SPECIALISATION_ROLES.join(", ")}`),

  body("specialisation")
    .if(body("designation").not().isIn(SPECIALISATION_ROLES))
    .custom((value) => {
      if (value !== undefined && value !== null) {
        throw new Error(`Specialisation is only applicable for: ${SPECIALISATION_ROLES.join(", ")}`);
      }
      return true;
    }),

  body("consultationFee")
    .if(body("designation").isIn(DOCTOR_ONLY_ROLES))
    .notEmpty().withMessage("Consultation fee is required for DOCTOR")
    .isFloat({ min: 0, max: 5000 }).withMessage("Consultation fee must be a number between 0 and 5000"),

  body("consultationFee")
    .if(body("designation").not().isIn(DOCTOR_ONLY_ROLES))
    .custom((value) => {
      if (value !== undefined && value !== null) {
        throw new Error("Consultation fee is only applicable for DOCTOR");
      }
      return true;
    }),


  body("availabilitySlots")
    .if(body("designation").isIn(DOCTOR_ONLY_ROLES))
    .isArray({ min: 1 })
    .withMessage("At least one availability slot is required for DOCTOR"),

  body("availabilitySlots")
    .if(body("designation").not().isIn(DOCTOR_ONLY_ROLES))
    .custom((value) => {
      if (value !== undefined && value !== null) {
        throw new Error("Availability slots are only applicable for DOCTOR");
      }
      return true;
    }),
];



const availabilitySlotFields = [
  body("availabilitySlots")
    .if(body("designation").isIn(DOCTOR_ONLY_ROLES))
    .isArray().withMessage("Availability slots must be an array")
    .custom((slots) => {
      const wellFormed = slots.filter(
        (s) => s?.day && s?.startTime && s?.endTime
          && TIME_REGEX.test(s.startTime)
          && TIME_REGEX.test(s.endTime)
      );

      const seenKeys = new Set();

      for (let i = 0; i < wellFormed.length; i++) {
        const a = wellFormed[i];

        if (a.startTime >= a.endTime) {
          throw new Error(`Slot on ${a.day}: end time must be after start time`);
        }

        const key = `${a.day}-${a.startTime}-${a.endTime}`;
        if (seenKeys.has(key)) {
          throw new Error(`Duplicate slot: ${a.day} ${a.startTime}–${a.endTime}`);
        }
        seenKeys.add(key);

        for (let j = i + 1; j < wellFormed.length; j++) {
          const b = wellFormed[j];
          if (
            a.day === b.day &&
            a.startTime < b.endTime &&
            a.endTime > b.startTime
          ) {
            throw new Error(
              `Overlapping slots on ${a.day}: ${a.startTime}–${a.endTime} overlaps with ${b.startTime}–${b.endTime}`
            );
          }
        }
      }

      return true;
    }),

  body("availabilitySlots.*.day")
    .if(body("designation").isIn(DOCTOR_ONLY_ROLES))
    .if(body("availabilitySlots").isArray({ min: 1 }))
    .notEmpty().withMessage("Day is required in each slot")
    .isIn(DAY_VALUES).withMessage("Invalid day"),

  body("availabilitySlots.*.startTime")
    .if(body("designation").isIn(DOCTOR_ONLY_ROLES))
    .if(body("availabilitySlots").isArray({ min: 1 }))
    .notEmpty().withMessage("Start time is required in each slot")
    .matches(TIME_REGEX).withMessage("Start time must be in HH:mm format"),

  body("availabilitySlots.*.endTime")
    .if(body("designation").isIn(DOCTOR_ONLY_ROLES))
    .if(body("availabilitySlots").isArray({ min: 1 }))
    .notEmpty().withMessage("End time is required in each slot")
    .matches(TIME_REGEX).withMessage("End time must be in HH:mm format"),
];



const signupValidation = [
  ...coreFields,
  ...qualificationFields,
  ...crossFieldRules,
  ...availabilitySlotFields,
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail().withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

module.exports = { signupValidation, loginValidation };