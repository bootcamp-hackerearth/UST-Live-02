const {body }=require('express-validator');

const signupValidation = [
    body("email").isEmail().withMessage("enter a valid email"),
    body("password")
    .isLength({min:8}).withMessage("min 8 characters"),
    body("firstName").notEmpty().withMessage("first name required"),
    body("lastName").notEmpty().withMessage("last name required")
];

module.exports = {signupValidation};