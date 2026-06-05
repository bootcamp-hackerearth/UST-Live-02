const { body } = require("express-validator");

const adminSignupValidation = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Valid email is required"),

    body("role")
        .notEmpty()
        .withMessage("Role is required")
        .isIn([
            "OWNER",
            "ADMIN",
            "DOCTOR",
            "RECEPTIONIST",
            "CASHIER",
            "NURSE",
            "LAB_TECH",
            "PHARMACIST",
            "TECHNICIAN"
        ])
        .withMessage("Invalid role"),

    body("name")
        .trim()
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters"),

    body("phone")
        .notEmpty()
        .withMessage("Phone is required")
        .isNumeric()
        .withMessage("Phone must contain only numbers")
        .isLength({ min: 10, max: 10 })
        .withMessage("Phone must be exactly 10 digits")
        .custom((value) => {
            if (value?.startsWith("0")) {
                throw new Error("Phone should not start with 0");
            }
            return true;
        }),

    body("department")
        .trim()
        .notEmpty()
        .withMessage("Department is required"),

    body("designation")
        .trim()
        .notEmpty()
        .withMessage("Designation is required"),

    body("joiningDate")
        .notEmpty()
        .withMessage("Joining date is required")
        .isISO8601()
        .withMessage("Invalid date format"),


    body("qualification")
        .notEmpty()
        .withMessage("Qualification is required")
        .isArray({ min: 1 })
        .withMessage("Qualification must be a non-empty array")
        .custom((arr) => {
            const isValid = arr.every(
                (item) => typeof item === "string" && item.trim().length > 0
            );

            if (!isValid) {
                throw new Error("Each qualification must be a valid non-empty string");
            }

            return true;
        })
        .customSanitizer((arr) =>
            arr.map((q) => q.trim())
        ),
    body("medicalRegistrationNo")
        .if(body("role").equals("DOCTOR"))
        .notEmpty()
        .withMessage("Medical registration number is required"),

    body("specialization")
        .if(body("role").equals("DOCTOR"))
        .notEmpty()
        .withMessage("Specialization is required"),

    body("consultationFee")
        .if(body("role").equals("DOCTOR"))
        .isNumeric()
        .withMessage("Consultation fee must be a number"),

    body("availabilitySlots")
        .optional()
        .isArray()
        .withMessage("Availability slots must be an array"),

    body("availabilitySlots.*")
        .optional()
        .matches(/^([0-1]\d|2[0-3]):([0-5]\d)-([0-1]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Invalid time slot format (HH:MM-HH:MM)")
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
    adminSignupValidation,
    loginValidation
};