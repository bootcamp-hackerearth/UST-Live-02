const Appointment = require("../../models/Appointment");

const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");

const cancelMyAppointment = async (appointmentId, patientId) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patientId,
    isDeleted: false,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  if (
    [
      STATUS.COMPLETED,
      STATUS.REJECTED,
      STATUS.NO_SHOW,
      STATUS.IN_CONSULTATION,
      STATUS.CANCELLED,
    ].includes(appointment.status)
  ) {
    throw new ApiError(
      400,
      "Appointment cannot be cancelled",
      "APPOINTMENT_CANNOT_BE_CANCELLED",
    );
  }

  appointment.status = STATUS.CANCELLED;

  await appointment.save();

  return appointment;
};

module.exports = cancelMyAppointment;
