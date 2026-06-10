const Employee = require("../../models/Employee");
const User = require("../../models/User");

const getDoctorAvailabilityService =
  async (userId) => {

    const user =
      await User.findById(
        userId
      );

    if (!user) {
      throw new Error(
        "User account not found"
      );
    }

    const doctor =
      await Employee.findById(
        user.employeeId
      );

    if (!doctor) {
      throw new Error(
        "Doctor not found"
      );
    }

    return doctor.availability;
  };

module.exports =
  getDoctorAvailabilityService;