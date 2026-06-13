const mongoose = require("mongoose");

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const registerPatient = require("../services/patient/register-patient.service");
const selfRegisterPatient = require( "../services/patient/self-register-patient.service");
const getMyProfile =require("../services/patient/get-my-profile.service");
const updateMyProfile =require("../services/patient/update-my-profile.service");
const getPatientDashboardService =require("../services/patient/get-patient-dashboard.service");


// Register a new patient
const createPatient = async (req, res) => {
  try {
    const serviceResponse = await registerPatient(req.body);

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      data: serviceResponse,
    });
  } catch (error) {
    console.error("CREATE PATIENT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register patient",
    });
  }
};

// Get all patients
const getPatients = async (req, res) => {
  try {
    let patients = [];

    // Doctors can only view patients linked to their appointments
    if (req.user.roles?.includes("DOCTOR")) {
      const appointments = await Appointment.find({
        doctorEmployeeId: req.user.employeeId,
      });

      const patientIds = [
        ...new Set(
          appointments.map((appointment) =>
            appointment.patientId.toString()
          )
        ),
      ];

      patients = await Patient.find({
        _id: {
          $in: patientIds,
        },
      })
        .populate("assignedDoctor")
        .sort({
          createdAt: -1,
        });
    } else {
      patients = await Patient.find()
        .populate("assignedDoctor")
        .sort({
          createdAt: -1,
        });
    }

    return res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: patients,
    });
  } catch (error) {
    console.error("GET PATIENTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve patients",
    });
  }
};

// Get patient details by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findById(id).populate("assignedDoctor");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
  } catch (error) {
    console.error("GET PATIENT BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve patient details",
    });
  }
};

// Update patient information
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }

    const patient = await Patient.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: patient,
    });
  } catch (error) {
    console.error("UPDATE PATIENT ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update patient details",
    });
  }
};
/*
|--------------------------------------------------------------------------
| Patient Self Registration
|--------------------------------------------------------------------------
*/
const registerPatientMobile = async (req, res) => {
  try {
    const serviceResponse =
      await selfRegisterPatient(
        req.body
      );

    return res.status(201).json({
      success: true,

      message:
        "Patient registered successfully",

      data: serviceResponse,
    });
  } catch (error) {
    console.error(
      "PATIENT REGISTRATION ERROR:",
      error
    );

    return res.status(400).json({
      success: false,

      message:
        error.message ||
        "Patient registration failed",
    });
  }
};
//Get my profile 
const getProfile =
async (
  req,
  res
) => {

  try {

    const patient =
      await getMyProfile(
        req.user.patientId
      );

    return res.status(200).json({
      success: true,

      data: patient,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};
// Update profile in mobile 
const updateProfile =
async (
  req,
  res
) => {

  try {

    const patient =
      await updateMyProfile(
        req.user.patientId,

        req.body
      );

    return res.status(200).json({
      success: true,

      message:
        "Profile updated successfully",

      data: patient,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,

      message:
        error.message,
    });
  }
};

// PAtient Dashboard
const getPatientDashboard =
async (
  req,
  res
) => {

  try {

    const dashboard =
      await getPatientDashboardService(
        req.user.patientId
      );

    return res.status(200).json({

      success: true,

      data:
        dashboard,
    });

  } catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message,
    });
  }
};

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  registerPatientMobile,
  getProfile,
  updateProfile,
  getPatientDashboard,

};