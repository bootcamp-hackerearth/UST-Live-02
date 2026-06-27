const Employee = require("../../models/Employee");
const User = require("../../models/User");
const ERR = require("../../utils/errors");

const getDoctorAvailabilityService = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
throw ERR.userAccountNotFound();
  }

  const doctor = await Employee.findById(user.employeeId);

  if (!doctor) {
throw ERR.doctorNotFound();
  }

  return doctor.availability;
};

module.exports = getDoctorAvailabilityService;
