const ApiResponse = require("../utils/ApiResponse");
const doctorService = require("../service/doctor.service");

const createDoctorByAdmin = async (req, res) => {
  try {
    const doctor = await doctorService.createDoctorByAdmin(
      req.body,
      req.user.userId,
    );

    return res
      .status(201)
      .json(new ApiResponse(201, "Doctor Created Successfully", doctor));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const updatedDoctor = await doctorService.updateDoctor(doctorId, req.body);

    return res
      .status(200)
      .json(new ApiResponse(200, "Doctor Updated Successfully", updatedDoctor));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const result = await doctorService.getAllDoctors(req.query);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Doctors fetched successfully",
      data: result.doctors,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorSpecializations = async (req, res, next) => {
  try {
    const specializations =
      await doctorService.getDoctorSpecializations();

    return res.status(200).json({
      success: true,
      message: 'Doctor specializations fetched successfully',
      data: specializations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createDoctorByAdmin,getAllDoctors,updateDoctor ,getDoctorSpecializations}