const Doctor = require("../models/doctor.model");
const ApiError = require("../utils/ApiError");
const { createEmployeeUser } = require("../services/user.service");

const createDoctor = async (doctorData) => {
  const {
    specialization,
    qualification,
    consultationFee,
    medicalRegistrationNo,
    availabilityStartTime,
    availabilityEndTime,
    experienceYears,
  } = doctorData;

  const existingDoctor = await Doctor.findOne({ medicalRegistrationNo });

  if (existingDoctor) {
    throw new ApiError(409, "Medical registration number already exists");
  }

  const { user, employee } = await createEmployeeUser(doctorData);

  const doctor = await Doctor.create({
    employeeId: employee._id,
    specialization,
    qualification,
    consultationFee,
    medicalRegistrationNo,
    availabilityStartTime,
    availabilityEndTime,
    experienceYears,
  });

  return {
    user,
    employee,
    doctor,
  };
};

module.exports = {
  createDoctor,
};
