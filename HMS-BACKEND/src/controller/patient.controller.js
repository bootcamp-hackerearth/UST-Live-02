// controllers/patient.controller.js
const ApiResponse=require('../utils/ApiResponse')
const patientService = require('../service/patient.service');

exports.createPatient = async (req, res, next) => {
  try {
    console.log("Logged in user:", req.user);
    const userId = req.user.userId; 
    const patient = await patientService.createPatient(req.body, userId);

    return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient
    });

  } catch (error) {
    next(error);
  }
};


exports.getAllPatients = async (req, res, next) => {
  try {
    const patients = await patientService.getAllPatients();

    return res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      data: patients
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
      data: result
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
                new ApiResponse(
                    200,
                    "Patient profile fetched successfully",
                    profile
                )
            );
    } catch (error) {
        next(error);
    }
};

exports.updatePatientProfile = async (req, res, next) => {
    try {
        const patient = await patientService.updatePatientProfile(
            req.user.userId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: patient
        });
    } catch (error) {
        next(error);
    }
};