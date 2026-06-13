const { body, param } = require('express-validator');

// Returns validators for a field, making them optional when isUpdate=true
const field = (chain, isUpdate) => isUpdate ? chain.optional() : chain;

const patientFields = (isUpdate = false) => [

    field(body("firstName")
        .trim()
        .notEmpty().withMessage("First Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("First Name must be between 2 and 50 characters"),
    isUpdate),

    field(body("lastName")
        .trim()
        .notEmpty().withMessage("Last Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Last Name must be between 2 and 50 characters"),
    isUpdate),

    field(body("phone")
        .notEmpty().withMessage("Phone is required")
        .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit phone number"),
    isUpdate),

    field(body("gender")
        .notEmpty().withMessage("Gender is required")
        .isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Gender must be MALE, FEMALE, or OTHER"),
    isUpdate),

    field(body("dob")
        .notEmpty().withMessage("Date of Birth is required")
        .isISO8601().withMessage("DOB must be a valid date")
        .custom((value) => {
            if (new Date(value) > new Date()) throw new Error("DOB cannot be in the future");
            return true;
        }),
    isUpdate),

    field(body("bloodGroup")
        .notEmpty().withMessage("Blood Group is required")
        .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).withMessage("Invalid Blood Group"),
    isUpdate),

    // Address fields are always optional — no change needed
    body("address.city").optional().trim()
        .isLength({ max: 100 }).withMessage("City must not exceed 100 characters"),

    body("address.state").optional().trim()
        .isLength({ max: 100 }).withMessage("State must not exceed 100 characters"),

    body("address.pincode").optional()
        .matches(/^\d{6}$/).withMessage("Pincode must be a valid 6-digit number"),

    field(body("emergencyContactName")
        .trim()
        .notEmpty().withMessage("Emergency Contact Name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Emergency Contact Name must be between 2 and 50 characters"),
    isUpdate),

    field(body("emergencyContactPhone")
        .notEmpty().withMessage("Emergency Contact Phone is required")
        .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit emergency contact phone number"),
    isUpdate),
];

const validateCreatePatient = patientFields(false);
const validateUpdatePatient = patientFields(true);

const validatePatientId = [
    param("id").isMongoId().withMessage("Invalid Patient ID")
];


const validateRegisterPatient = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email address")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    ...patientFields(false),
];

module.exports = { validateCreatePatient, validateUpdatePatient, validatePatientId , validateRegisterPatient};