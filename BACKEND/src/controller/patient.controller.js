// controllers/patient.controller.js
const ApiResponse = require("../utils/ApiResponse");
const patientService = require("../service/patient.service");

exports.createPatient = async (req, res, next) => {
  try {
    const employeeId = req.user.userId;

    const result = await patientService.createPatient(req.body, employeeId);

    const message = result.credentialsEmailSent
      ? "Patient created and login credentials emailed successfully"
      : "Patient created, but login credentials email could not be sent";

    return res.status(201).json({
      success: true,
      message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPatients = async (req, res, next) => {
  try {
    const result = await patientService.getAllPatients(req.query);

    return res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      data: result.patients,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

exports.registerPatient = async (req, res, next) => {
  try {
    const result = await patientService.registerPatient(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.getPatientProfile = async (req, res, next) => {
  try {
    console.log("Logged in userId:", req.user.userId);
    const userId = req.user.userId;

    const profile = await patientService.getPatientProfile(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Patient profile fetched successfully", profile),
      );
  } catch (error) {
    next(error);
  }
};

exports.updatePatientProfile = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatientProfile(
      req.user.userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await patientService.updatePatient(
      req.params.patientId,
      req.body,
    );

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

exports.softDeletePatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const deletedByUserId = req.user.userId;

    const result = await patientService.softDeletePatientById(
      patientId,
      deletedByUserId
    );

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: result
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Unable to delete patient"
    });
  }
};
