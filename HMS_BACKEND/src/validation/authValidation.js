const { body } = require('express-validator');
const validateSignUp = [

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

    body("role")
        .notEmpty()
        .withMessage("Role is required"),

    body("department")
        .notEmpty()
        .withMessage("Department is required")
        .isIn(['OPD', 'IPD', 'Lab', 'Pharmacy', 'Admin', 'Front Office'])
        .withMessage("Invalid department"),

    body("designation")
        .notEmpty()
        .withMessage("Designation is required")
        .isIn(['Jr Doctor', 'Nurse', 'Receptionist', 'Administrator'])
        .withMessage("Invalid designation"),

    body("joiningDate")
        .notEmpty()
        .withMessage("Joining Date is required")
        .isISO8601({ strict: true })
        .withMessage("Joining Date must be a valid date in YYYY-MM-DD format")

];


const validateLogin = [
    body("email").notEmpty().withMessage("Enter an Email").isEmail().withMessage("Enter a Valid email"),
    body("password").notEmpty().withMessage("Password is Required")
]

module.exports = { validateSignUp, validateLogin };