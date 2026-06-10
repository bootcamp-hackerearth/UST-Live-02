const Employee = require("../../models/Employee");
const User = require("../../models/User");

const updateDoctorAvailabilityService =
  async (
    userId,
    availabilityData
  ) => {

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
      await Employee.findByIdAndUpdate(
        user.employeeId,
        {
          $set: {
            availability:
              availabilityData,
          },
        },
        {
          returnDocument:
            "after",
        }
      );

    if (!doctor) {
      throw new Error(
        "Doctor not found"
      );
    }

    return doctor;
  };

module.exports =
  updateDoctorAvailabilityService;