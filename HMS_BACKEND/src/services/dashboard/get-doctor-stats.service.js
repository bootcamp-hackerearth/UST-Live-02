const Appointment = require("../../models/Appointment");

const getDoctorStatsService = async (doctorEmployeeId) => {
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId,
    isDeleted: { $ne: true },
  });

  const completedConsultations = await Appointment.countDocuments({
    doctorEmployeeId,
    isDeleted: { $ne: true },
    status: "COMPLETED",
  });

  const pendingConsultations = await Appointment.countDocuments({
    doctorEmployeeId,
    isDeleted: { $ne: true },
    status: "BOOKED",
  });

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todayString = today.toISOString().split("T")[0];

  const todayPatients = await Appointment.countDocuments({
    doctorEmployeeId,
    isDeleted: { $ne: true },
    appointmentDate: todayString,
  });

  return {
    totalAppointments,
    completedConsultations,
    pendingConsultations,
    todayPatients,
  };
};

module.exports = getDoctorStatsService;

