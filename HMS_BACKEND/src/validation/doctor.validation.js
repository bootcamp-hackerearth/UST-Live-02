const { body } = require('express-validator');

const validateCreateDoctor = [
    body("firstName")
        .notEmpty()
        .withMessage("First Name is required"),

    body("lastName")
        .notEmpty()
        .withMessage("Last Name is required"),

    body("email")
        .isEmail()
        .withMessage("Not a valid Email"),

    body("password")
        .isStrongPassword()
        .withMessage("Enter a Strong Password"),

    body("phone")
        .isMobilePhone()
        .withMessage("Enter a Valid Phone No"),

    body("department")
        .notEmpty()
        .withMessage("Department is required")
        .isIn(['OPD', 'IPD', 'Lab', 'Pharmacy', 'Admin', 'Front Office'])
        .withMessage("Invalid department"),

    body("designation")
        .notEmpty()
        .withMessage("Designation is required")
        .isIn(['Jr Doctor'])
        .withMessage("Doctor designation must be Jr Doctor"),

    body("joiningDate")
        .notEmpty()
        .withMessage("Joining Date is required")
        .isISO8601({ strict: true })
        .withMessage("Joining Date must be a valid date in YYYY-MM-DD format"),

    body("specialization")
        .notEmpty()
        .withMessage("Specialization is required"),

    body("qualification")
        .notEmpty()
        .withMessage("Qualification is required"),

    body("consultationFee")
        .notEmpty()
        .withMessage("Consultation fee is required")
        .isNumeric()
        .withMessage("Consultation fee must be a number"),

    body("medicalRegistrationNo")
        .notEmpty()
        .withMessage("Medical registration number is required"),

    body("availabilityStartTime")
        .notEmpty()
        .withMessage("Availability start time is required")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Availability start time must be in HH:mm 24-hour format"),

    body("availabilityEndTime")
        .notEmpty()
        .withMessage("Availability end time is required")
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage("Availability end time must be in HH:mm 24-hour format"),
];

module.exports = {
    validateCreateDoctor
};