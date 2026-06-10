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