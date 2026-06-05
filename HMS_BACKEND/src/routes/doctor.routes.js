const express = require('express');
const { createDoctorUser } = require('../controllers/doctor.controller.js');
const authorize = require('../middlewares/authorize.middleware');
const router = express.Router();

router.post('/', authorize('CREATE_USER'),createDoctorUser);

module.exports = router;