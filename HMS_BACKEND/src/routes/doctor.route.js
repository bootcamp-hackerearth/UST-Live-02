const express = require('express');
const { createDoctorUser } = require('../controllers/doctor.controller');
const router = express.Router();
const { userSignUpValidator, employeeValidator, doctorValidator } = require('../middlewares/validator.middleware');
const authorize = require('../middlewares/authorize.middleware');
const { validate } = require('../middlewares/validate.middleware');
router.post('/', userSignUpValidator,employeeValidator,doctorValidator,validate,authorize('CREATE_USER'),createDoctorUser);
module.exports = router;