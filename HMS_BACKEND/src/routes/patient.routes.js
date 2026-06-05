const express = require('express');
const router = express.Router();
const { createPatient } = require('../controllers/patient.controller.js');
const authorize = require('../middlewares/authorize.middleware');

router.post('/', authorize('CREATE_PATIENT'), createPatient);

module.exports = router;