const asyncHandler = require('express-async-handler');
const patientService = require('../services/patient.service');
const ApiResponse = require('../utils/ApiResponse');

const createPatient = asyncHandler(async (req, res) => {
    const user = await patientService.createPatient(req.body);
    res.status(201).json(new ApiResponse(201, user));
});


module.exports = {
    createPatient
};