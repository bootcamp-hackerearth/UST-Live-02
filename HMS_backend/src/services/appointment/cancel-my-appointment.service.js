const Appointment = require("../../models/Appointment");
const ERR = require("../../utils/errors");

const cancelMyAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patientId,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
throw ERR.appointmentNotFound();}

  if (
    [
      "COMPLETED",
      "REJECTED",
      "NO_SHOW",
      "IN_CONSULTATION",
      "CANCELLED",
    ].includes(appointment.status)
  ) {
throw ERR.appointmentCancelConflict();  }

  appointment.status = "CANCELLED";

  await appointment.save();

  return appointment;
};

module.exports = cancelMyAppointment;

