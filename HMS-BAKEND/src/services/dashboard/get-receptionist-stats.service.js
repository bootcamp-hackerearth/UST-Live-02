const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");

const getReceptionistStatsService = async () => {
  const todayAppointments = await Appointment.countDocuments();

  const totalPatients = await Patient.countDocuments();

  const checkedInPatients = await Appointment.countDocuments({
    status: "IN_CONSULTATION",
  });

  const pendingAppointments = await Appointment.countDocuments({
    status: "BOOKED",
  });

  return {
    todayAppointments,
    totalPatients,
    checkedInPatients,
    pendingAppointments,
  };
};

module.exports = getReceptionistStatsService;
