const { body } = require('express-validator');

const validateCreateEmployeeByAdmin = [

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
        .withMessage("Department is required"),

    body("designation")
        .notEmpty()
        .withMessage("Designation is required"),

    body("joiningDate")
        .notEmpty()
        .withMessage("Joining Date is required")

];



module.exports = { validateCreateEmployeeByAdmin};