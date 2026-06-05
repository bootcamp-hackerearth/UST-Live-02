const express = require("express");
const { createDoctorUser } = require("../controllers/doctor.controller.js");
const router = express.Router();
const authorize = require("../middlewares/authorize.middleware");
const {validate}=require("../middlewares/validator.middleware.js")
const { signupValidation,employeeValidator,doctorValidator } = require("../middlewares/auth.validation.js");
router.post('/', signupValidation,employeeValidator,doctorValidator,validate,authorize('CREATE_USER'),createDoctorUser);

module.exports = router;
