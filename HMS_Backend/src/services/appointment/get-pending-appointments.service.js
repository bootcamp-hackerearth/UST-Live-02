const Appointment =
require("../../models/Appointment");

const getPendingAppointments =
async () => {

  return Appointment.find({
    status: "PENDING",
  })

    .populate("patientId")

    .populate("doctorEmployeeId")

    .sort({
      createdAt: -1,
    });
};

module.exports =
  getPendingAppointments;