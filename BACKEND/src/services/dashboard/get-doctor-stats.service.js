const Appointment = require("../../models/Appointment");
const STATUS = require("../../constants/status");

const getDoctorStatsService = async (doctorEmployeeId) => {
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId,
    isDeleted: false,
  });

  const completedConsultations = await Appointment.countDocuments({
    doctorEmployeeId,
    status: STATUS.COMPLETED,
    isDeleted: false,
  });

  const pendingConsultations = await Appointment.countDocuments({
    doctorEmployeeId,
    status: STATUS.BOOKED,
    isDeleted: false,
  });

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const todayString = today.toISOString().split("T")[0];

  const todayPatients = await Appointment.countDocuments({
    doctorEmployeeId,
    appointmentDate: todayString,
    isDeleted: false,
  });

  return {
    totalAppointments,
    completedConsultations,
    pendingConsultations,
    todayPatients,
  };
};

module.exports = getDoctorStatsService;
