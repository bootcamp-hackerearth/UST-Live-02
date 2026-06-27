  const mongoose = require("mongoose");

  const Patient = require("../models/Patient");
  const Appointment = require("../models/Appointment");
  const registerPatient = require("../services/patient/register-patient.service");
  const selfRegisterPatient = require("../services/patient/self-register-patient.service");
  const getMyProfile = require("../services/patient/get-my-profile.service");
  const updateMyProfile = require("../services/patient/update-my-profile.service");
  const getPatientDashboardService = require("../services/patient/get-patient-dashboard.service");
  const deletePatientService = require("../services/patient/delete-patient.service");
  const asyncHandler = require("../utils/asyncHandler");
  const ERR = require("../utils/errors");
  const {
    getPagination,
    getPaginationMeta,
    buildSearchFilter,
  } = require("../utils/pagination");

  // Register a new patient
  const createPatient = asyncHandler(async (req, res) => {
    const serviceResponse = await registerPatient(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: serviceResponse,
    });
  });

  // Get all patients
  const getPatients = asyncHandler(async (req, res) => {
    const { page, limit, skip, sort, search, status } = getPagination(req.query, {
      allowedSortFields: ["createdAt", "firstName", "lastName", "patientId"],
      defaultSort: { createdAt: -1 },
    });

    let filter = {
      isDeleted: { $ne: true },
    };

    if (req.user.roles?.includes("DOCTOR")) {
      const appointments = await Appointment.find({
        doctorEmployeeId: req.user.employeeId,
        isDeleted: { $ne: true },
      }).select("patientId");

      const patientIds = [
        ...new Set(
          appointments.map((appointment) => appointment.patientId.toString())
        ),
      ];

      filter = {
        isDeleted: { $ne: true },
        _id: { $in: patientIds },
      };
    }

    if (search) {
      filter = {
        ...filter,
        ...buildSearchFilter(
          ["patientId", "firstName", "lastName", "phone", "email"],
          search
        ),
      };
    }

    if (status) {
      filter.status = status;
    }

    const total = await Patient.countDocuments(filter);

    const patients = await Patient.find(filter)
      .populate("assignedDoctor")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
      pagination: getPaginationMeta({
        page,
        limit,
        total,
      }),
    });
  });

  // Get patient details by ID
  const getPatientById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ERR.invalidPatientId();
    }

    const patient = await Patient.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).populate("assignedDoctor");

    if (!patient) {
      throw ERR.patientNotFound();
    }

    if (req.user.roles?.includes("DOCTOR")) {
      const hasHandledPatient = await Appointment.exists({
        patientId: id,
        doctorEmployeeId: req.user.employeeId,
        isDeleted: { $ne: true },
      });

      if (!hasHandledPatient) {
        throw ERR.unauthorizedAccess();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
  });

  // Update patient information
  const updatePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ERR.invalidPatientId();
    }

    const patient = await Patient.findOneAndUpdate(
      {
        _id: id,
        isDeleted: { $ne: true },
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!patient) {
      throw ERR.patientNotFound();
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  });

  // Soft delete patient
  const deletePatient = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ERR.invalidPatientId();
    }

    await deletePatientService(id, req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  });

  //  Patient Self Registration
  const registerPatientMobile = asyncHandler(async (req, res) => {
    const serviceResponse = await selfRegisterPatient(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: serviceResponse,
    });
  });

  //Get my profile
  const getProfile = asyncHandler(async (req, res) => {
    const patient = await getMyProfile(req.user.patientId);

    return res.status(200).json({
      success: true,
      data: patient,
    });
  });

  // Update profile in mobile
  const updateProfile = asyncHandler(async (req, res) => {
    const patient = await updateMyProfile(req.user.patientId, req.body);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: patient,
    });
  });

  // Patient Dashboard
  const getPatientDashboard = asyncHandler(async (req, res) => {
    const dashboard = await getPatientDashboardService(req.user.patientId);

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  });

  module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    registerPatientMobile,
    getProfile,
    updateProfile,
    getPatientDashboard,
  };

