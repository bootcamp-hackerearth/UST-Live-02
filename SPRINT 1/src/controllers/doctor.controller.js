const doctorService = require("../services/doctor.service.js");
const asyncHandler = require("express-async-handler");
const ApiResponse = require("../utils/ApiResponce.js");
const createDoctorUser = asyncHandler(async (req, res) => {
  const response = await doctorService.createDoctor(req.body);
  res.status(201).json(new ApiResponse(201, response));
});
module.exports = { createDoctorUser };
