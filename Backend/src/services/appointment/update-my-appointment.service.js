const Appointment = require("../../models/Appointment");
const ERR = require("../../utils/errors");

const updateMyAppointment = async (appointmentId, patientId, updateData) => {
  const { appointmentDate, appointmentTime, symptoms } = updateData;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
    throw ERR.appointmentNotFound();
  }

  if (appointment.patientId.toString() !== patientId) {
    throw ERR.unauthorizedAccess();
  }

  if (appointment.status !== "PENDING") {
    throw ERR.appointmentModifyConflict();
  }

  const selectedDate = new Date(appointmentDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw ERR.pastDateNotAllowed();
  }

  const [year, month, day] = appointmentDate.split("-").map(Number);

  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);

  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingAppointment = await Appointment.findOne({
    _id: {
      $ne: appointmentId,
    },
    isDeleted: { $ne: true },
    doctorEmployeeId: appointment.doctorEmployeeId,
    timeSlot: appointmentTime,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $nin: ["CANCELLED", "REJECTED", "NO_SHOW"],
    },
  });

  if (existingAppointment) {
    throw ERR.slotAlreadyBooked();
  }

  appointment.appointmentDate = appointmentDate;
  appointment.timeSlot = appointmentTime;
  appointment.symptoms = symptoms || [];

  await appointment.save();

  return appointment;
};

module.exports = updateMyAppointment;

