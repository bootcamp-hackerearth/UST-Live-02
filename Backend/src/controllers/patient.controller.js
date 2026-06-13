const mongoose = require("mongoose");

const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

const registerPatient = require("../services/patient/register-patient.service");

const getPatientLookupForUser = async (requestUser) => {
  const dbUser = await User.findById(requestUser.userId);

  return {
    $or: [
      ...(mongoose.Types.ObjectId.isValid(requestUser.patientObjectId)
        ? [{ _id: requestUser.patientObjectId }]
        : []),
      { userId: requestUser.userId },
      { user: requestUser.userId },
      { patientId: requestUser.patientId },
      { email: requestUser.email },
      ...(dbUser
        ? [
            { userId: dbUser._id },
            { user: dbUser._id },
            { patientId: dbUser.patientId },
            { email: dbUser.email },
          ]
        : []),
    ],
  };
};

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

    // -------------------------
    // DUPLICATE KEY (MongoDB)
    // -------------------------
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already exists",
      });
    }

    // -------------------------
    // CUSTOM SERVICE ERRORS
    // -------------------------
    if (
      error.message === "User already exists" ||
      error.message === "Email already registered" ||
      error.message === "Phone number already registered"
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    // -------------------------
    // VALIDATION ERRORS
    // -------------------------
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register patient",
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
          appointments.map((appointment) => appointment.patientId.toString()),
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
      patients = await Patient.find().populate("assignedDoctor").sort({
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

const getMyProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne(
      await getPatientLookupForUser(req.user),
    ).populate("assignedDoctor");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    console.error("GET MY PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve patient profile",
    });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "address",
      "city",
      "state",
      "pincode",
      "country",
      "bloodGroup",
      "gender",
      "maritalStatus",
      "emergencyContactName",
      "emergencyContactPhone",
      "relationship",
      "allergies",
      "insuranceProvider",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updateData[field] = req.body[field];
      }
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();

      const existingUser = await User.findOne({
        _id: { $ne: req.user.userId },
        email: updateData.email,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    if (updateData.phone) {
      const existingPatient = await Patient.findOne({
        $and: [
          { phone: updateData.phone },
          {
            $nor: [
              { userId: req.user.userId },
              { user: req.user.userId },
              { patientId: req.user.patientId },
              { email: req.user.email },
            ],
          },
        ],
      });

      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    const patientLookup = await getPatientLookupForUser(req.user);

    const patient = await Patient.findOneAndUpdate(
      patientLookup,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    ).populate("assignedDoctor");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const userUpdate = {};

    if (updateData.email) userUpdate.email = updateData.email;
    if (updateData.phone) userUpdate.phone = updateData.phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user.userId, userUpdate);
    }

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully",
      data: patient,
    });
  } catch (error) {
    console.error("UPDATE MY PROFILE ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already exists",
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
      message: "Failed to update patient profile",
    });
  }
};
module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  getMyProfile,
  updateMyProfile,
};
