const Employee = require("../../models/Employee");
const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const updateDoctorAvailabilityService = async (
  userId,
  availabilityData,
  updatedBy,
) => {
  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
  });

  if (!user) {
    throw new ApiError(404, "User account not found", "USER_NOT_FOUND");
  }

  const doctor = await Employee.findOne({
    _id: user.employeeId,
    isDeleted: false,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found", "DOCTOR_NOT_FOUND");
  }

  doctor.availability = availabilityData;

  doctor.updatedBy = updatedBy;

  await doctor.save();

  return doctor;
};

module.exports = updateDoctorAvailabilityService;
