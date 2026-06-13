const Appointment = require("../../models/Appointment");

const getDoctorStatsService = async (doctorEmployeeId) => {
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId,
  });

  const completedConsultations = await Appointment.countDocuments({
    doctorEmployeeId,
    status: "COMPLETED",
  });

  const pendingConsultations = await Appointment.countDocuments({
    doctorEmployeeId,
    status: "BOOKED",
  });

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todayString = today.toISOString().split("T")[0];

  const todayPatients = await Appointment.countDocuments({
    doctorEmployeeId,
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
