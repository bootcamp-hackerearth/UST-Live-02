const doctorService = require('../services/doctor.service');
const asyncHandler = require('express-async-handler');
const ApiResponse = require('../utils/ApiResponse');
const createDoctorUser = asyncHandler(async (req, res) => {
    console.log('in controller');

    const response = await doctorService.createDoctor(req.body);
    res.status(201).json(new ApiResponse(201, response));
});
module.exports = { createDoctorUser };