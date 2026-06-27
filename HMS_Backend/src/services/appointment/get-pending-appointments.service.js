const Appointment = require("../../models/Appointment");

const STATUS = require("../../constants/status");

const getPendingAppointments = async () => {
  return Appointment.find({
    status: STATUS.PENDING,

    isDeleted: false,
  })
    .populate({
      path: "patientId",
      match: {
        isDeleted: false,
      },
    })
    .populate({
      path: "doctorEmployeeId",

      match: {
        isDeleted: false,
      },
    })
    .sort({
      createdAt: -1,
    });
};

module.exports = getPendingAppointments;
