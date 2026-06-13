const Appointment = require("../../models/Appointment");

const adminUpdateAppointment = async (id, data) => {
  const appointment = await Appointment.findByIdAndUpdate(id, data, {
    new: true,
  });

  if (!appointment) throw new Error("Appointment not found");

  return appointment;
};

module.exports = adminUpdateAppointment;
