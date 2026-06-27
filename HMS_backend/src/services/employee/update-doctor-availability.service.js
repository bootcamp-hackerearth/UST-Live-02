const Employee = require("../../models/Employee");
const User = require("../../models/User");
const ERR = require("../../utils/errors");

const convertToMinutes = (time) => {
  if (!time) {
    return null;
  }

  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};

const updateDoctorAvailabilityService = async (userId, availabilityData) => {
  const user = await User.findById(userId);

  if (!user) {
throw ERR.userAccountNotFound();
  }

  const startMinutes = convertToMinutes(availabilityData.startTime);
  const endMinutes = convertToMinutes(availabilityData.endTime);

  if (
    startMinutes !== null &&
    endMinutes !== null &&
    endMinutes <= startMinutes
  ) {
throw ERR.invalidDoctorAvailability();
  }

  const doctor = await Employee.findByIdAndUpdate(
    user.employeeId,
    {
      $set: {
        availability: availabilityData,
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!doctor) {
throw ERR.doctorNotFound();
  }
  return doctor;
};

module.exports = updateDoctorAvailabilityService;
