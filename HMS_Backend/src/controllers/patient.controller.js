const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const Patient = require("../models/Patient");
const registerPatient = require("../services/patient/register-patient.service");
const selfRegisterPatient = require("../services/patient/self-register-patient.service");
const getMyProfile = require("../services/patient/get-my-profile.service");
const updateMyProfile = require("../services/patient/update-my-profile.service");
const getPatientDashboardService = require("../services/patient/get-patient-dashboard.service");
const deletePatientService = require("../services/patient/delete-patient.service");
const getPatientsService = require("../services/patient/get-patients.service");

const validateObjectId = (id, message) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message, "INVALID_ID");
  }
};

const createPatient = asyncHandler(async (req, res) => {
  const serviceResponse = await registerPatient(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "Patient registered successfully", serviceResponse));
});

const getPatients = asyncHandler(async (req, res) => {
  const result = await getPatientsService(req.user, req.query);

  return res.status(200).json({
    ...new ApiResponse(200, "Patients retrieved successfully", result.data),
    meta: result.meta,
  });
});

const getPatientById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid patient ID");

  const patient = await Patient.findById(id).populate("assignedDoctor");

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Patient retrieved successfully", patient));
});

const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateObjectId(id, "Invalid patient ID");

  const patient = await Patient.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Patient updated successfully", patient));
});

const registerPatientMobile = asyncHandler(async (req, res) => {
  const serviceResponse = await selfRegisterPatient(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, "Patient registered successfully", serviceResponse));
});

const getProfile = asyncHandler(async (req, res) => {
  const patient = await getMyProfile(req.user.patientId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Patient profile retrieved successfully", patient));
});

const updateProfile = asyncHandler(async (req, res) => {
  const patient = await updateMyProfile(req.user.patientId, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile updated successfully", patient));
});

const getPatientDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getPatientDashboardService(req.user.patientId);

  return res
    .status(200)
    .json(new ApiResponse(200, "Patient dashboard retrieved successfully", dashboard));
});

const deletePatient = asyncHandler(async (req, res) => {
  const result = await deletePatientService(req.params.id, req.user.userId);

  return res.status(200).json(new ApiResponse(200, result.message, result));
});

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  registerPatientMobile,
  getProfile,
  updateProfile,
  getPatientDashboard,
  deletePatient,
};
