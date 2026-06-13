const Appointment = require("../../models/Appointment");

const updateMyAppointment = async (
  appointmentId,
  patientId,
  updateData
) => {

  const {
    appointmentDate,
    appointmentTime,
    symptoms,
  } = updateData;

  const appointment =
    await Appointment.findById(
      appointmentId
    );

  if (!appointment) {
    throw new Error(
      "Appointment not found"
    );
  }

  if (
    appointment.patientId.toString() !==
    patientId
  ) {
    throw new Error(
      "Unauthorized access"
    );
  }

  if (
    appointment.status !==
    "PENDING"
  ) {
    throw new Error(
      "Only pending appointments can be modified"
    );
  }

  const selectedDate =
    new Date(
      appointmentDate
    );

  const today =
    new Date();

  today.setHours(
    0, 0, 0, 0
  );

  selectedDate.setHours(
    0, 0, 0, 0
  );

  if (
    selectedDate < today
  ) {
    throw new Error(
      "Past date not allowed"
    );
  }

  const [year, month, day] =
    appointmentDate
      .split("-")
      .map(Number);

  const normalizedDate =
    new Date(
      year,
      month - 1,
      day,
      12,
      0,
      0
    );

  const nextDay =
    new Date(
      normalizedDate
    );

  nextDay.setDate(
    nextDay.getDate() + 1
  );

  const existingAppointment =
    await Appointment.findOne({

      _id: {
        $ne: appointmentId,
      },

      doctorEmployeeId:
        appointment.doctorEmployeeId,

      timeSlot:
        appointmentTime,

      appointmentDate: {
        $gte:
          normalizedDate,

        $lt:
          nextDay,
      },

      status: {
        $nin: [
          "CANCELLED",
          "REJECTED",
          "NO_SHOW",
        ],
      },
    });

  if (
    existingAppointment
  ) {
    throw new Error(
      "Selected slot already booked"
    );
  }

  appointment.appointmentDate =
    appointmentDate;

  appointment.timeSlot =
    appointmentTime;

  appointment.symptoms =
    symptoms || [];

  await appointment.save();

  return appointment;
};

module.exports =
  updateMyAppointment;