const Doctor = require("../models/doctor.model");

const { createEmployeeUser } = require("./user.service");

const createDoctor = async (doctorData) => {
  const { user, employee } = await createEmployeeUser(doctorData);

  const {
    specialization,
    qualification,
    consultationFee,
    medicalRegistrationNo,
    availabilityStartTime,
    availabilityEndTime,
    experienceYears,
  } = doctorData;

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
