const Appointment = require("../models/Appointment");

const generateAppointmentId = async () => {
  // Generate prefix using current year and month
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `APT-${year}${month}`;

  // Find latest appointment for current month
  const latestAppointment = await Appointment.findOne({
    appointmentId: {
      $regex: `^${prefix}`,
    },
  }).sort({
    appointmentId: -1,
  });

  let sequence = 1;

  // Increment sequence if previous records exist
  if (latestAppointment) {
    const lastSequence = Number.parseInt(
      latestAppointment.appointmentId.slice(-5),
    );

    sequence = lastSequence + 1;
  }

  return `${prefix}${String(sequence).padStart(5, "0")}`;
};

module.exports = generateAppointmentId;
