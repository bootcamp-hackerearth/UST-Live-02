const { body, query } = require("express-validator");
 
const allowedRoleTypes = [
    "Admin",
    "Doctor",
    "Receptionist",
    "Cashier",
    "Nurse",
    "Pharmacist",
    "LabTech"
];
 
const allowedDepartments = ["OPD", "IPD", "ICU", "Pharmacy", "Administration", "Front Office"];
 
const medicalRoles = new Set([
  "Doctor",
  "Nurse",
  "Pharmacist",
  "LabTech"
]);
 
const allowedStatusTypes = ["Active", "Inactive", "Pending"];
 
const validateSignUp = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required.")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name must contain only letters and spaces"),
    body("email")
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email format"),
    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 8 })
        .withMessage("Password must contain atleast 8 characters.")
        .matches(/[A-Z]/).withMessage("Must contain uppercase")
        .matches(/\d/).withMessage("Must contain number"),
 
    body("department").notEmpty().withMessage("Department is required.").isIn(allowedDepartments).withMessage("Invalid department."),
    body("role")
        .notEmpty()
        .withMessage("Role is required.")
        .isIn(allowedRoleTypes)
        .withMessage("Invalid role."),
    body("designation").notEmpty().withMessage("Designation is required"),
 
    body("joiningDate")
        .notEmpty()
        .withMessage("Joining date is required.")
        .isISO8601()
        .withMessage("Invalid date format"),
 
    body("consultationFee").custom((value, { req }) => {
        if (req.body.role === "Doctor") {
            if (!value) {
                throw new Error("Consultation fee is required for doctors.");
            }
            if (Number.isNaN(value)) {
                throw new TypeError("Consultation fee must be numeric.");
            }
        } else if (value) {
            throw new Error("Consultation fee is only for doctors");
        }
        return true;
    }),
 
    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required")
        .customSanitizer((value) => value.replaceAll(/\s+/g, ""))
        .isMobilePhone("en-IN")
        .withMessage("Enter a valid phone number"),
 
    body("availabilitySlots").custom((value, { req }) => {
        if (req.body.role === "Doctor") {
            if (!Array.isArray(value) || value.length === 0) {
                throw new Error("Availability slots are required for doctors.");
            }
        }
         if(req.body.role !== "Doctor") {
            if (Array.isArray(value) ) {
                throw new TypeError("Availability slots are  not required for doctors.");
            }
        }
        return true;
    }),
 
    body("medicalRegistrationNo").custom((value, { req }) => {
    const isMedicalRole = medicalRoles.has(req.body.role);

    if (isMedicalRole && !value) {
        throw new Error(
            "Medical registration no is required for this role"
        );
    }
    if (!isMedicalRole && value) {
        throw new Error(
            "Medical registration no is allowed only for medical roles"
        );
    }

    return true;
}),
 
    body("specialization").custom((value, { req }) => {
        if (req.body.role === "Doctor") {
            if (!value) {
                throw new Error("Specialization is required for this role");
            }
        }
        if (req.body.role !== "Doctor") {
            if(value){
                throw new Error("Specialization is not  required for this role");
            }
        }
        return true;
    })
];
 
const validateLogin = [
    body("email")
        .notEmpty()
        .withMessage("Email is required.")
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage("Invalid email format"),
    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({ min: 8 })
        .withMessage("Password must contain atleast 8 characters."),
];
 
module.exports = { validateSignUp, validateLogin };