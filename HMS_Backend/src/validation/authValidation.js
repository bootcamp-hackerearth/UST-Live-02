const { body } = require("express-validator");

const dayValues = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const signupValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one special character"),

  body("designation")
    .optional()
    .isIn([
      "OWNER",
      "DOCTOR",
      "NURSE",
      "RECEPTIONIST",
      "CASHIER",
      "LAB_TECH",
      "PHARMACIST",
      "ADMIN"
    ])
    .withMessage("Designation mismatch"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),

  body("phone")
    .optional()
    .trim()
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits"),

  body("department")
    .optional()
    .isIn(["OPD", "IPD", "LAB", "PHARMACY", "ADMIN"])
    .withMessage("Department mismatch"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Proper date format is required"),

  body("availabilitySlots")
  .optional()
  .isArray()
  .withMessage("Availability slots must be an array")
  .custom((slots) => {
    const seenSlots = new Set();

    for (let i = 0; i < slots.length; i += 1) {
      const slot = slots[i];

      if (!slot.day || !slot.startTime || !slot.endTime) {
        continue;
      }

      const slotKey = `${slot.day}-${slot.startTime}-${slot.endTime}`;

      if (seenSlots.has(slotKey)) {
        throw new Error("Duplicate availability slot is not allowed");
      }

      seenSlots.add(slotKey);

      for (let j = i + 1; j < slots.length; j += 1) {
        const otherSlot = slots[j];

        if (
          !otherSlot.day ||
          !otherSlot.startTime ||
          !otherSlot.endTime
        ) {
          continue;
        }

        const isSameDay = slot.day === otherSlot.day;

        const isOverlapping =
          slot.startTime < otherSlot.endTime &&
          slot.endTime > otherSlot.startTime;

        if (isSameDay && isOverlapping) {
          throw new Error("Overlapping availability slots are not allowed");
        }
      }
    }

    return true;
  }),

body("availabilitySlots.*.day")
  .if(body("availabilitySlots").exists())
  .notEmpty()
  .withMessage("Day is required")
  .isIn(dayValues)
  .withMessage("Invalid day"),

body("availabilitySlots.*.startTime")
  .if(body("availabilitySlots").exists())
  .notEmpty()
  .withMessage("Start time is required")
  .matches(timeRegex)
  .withMessage("Start time must be in HH:mm format"),

body("availabilitySlots.*.endTime")
  .if(body("availabilitySlots").exists())
  .notEmpty()
  .withMessage("End time is required")
  .matches(timeRegex)
  .withMessage("End time must be in HH:mm format"),

body("availabilitySlots.*")
  .custom((slot) => {
    if (!slot.startTime || !slot.endTime) {
      return true;
    }

    if (slot.startTime >= slot.endTime) {
      throw new Error("End time must be after start time");
    }

    return true;
  })
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

module.exports = {
  signupValidation,
  loginValidation
};