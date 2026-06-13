const Appointment =
require("../../models/Appointment");

const cancelMyAppointment =
async (
  appointmentId,
  patientId
) => {

  const appointment =
    await Appointment.findOne({

      _id: appointmentId,

      patientId,
    });

  if (!appointment) {

    throw new Error(
      "Appointment not found"
    );
  }

  if (
    [
      "COMPLETED",
      "REJECTED",
      "NO_SHOW",
      "IN_CONSULTATION",
      "CANCELLED",
    ].includes(
      appointment.status
    )
  ) {

    throw new Error(
      "Appointment cannot be cancelled"
    );
  }

  appointment.status =
    "CANCELLED";

  await appointment.save();

  return appointment;
};

module.exports =
  cancelMyAppointment;