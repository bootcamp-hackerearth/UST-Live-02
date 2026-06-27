const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");

const getReceptionistStatsService = async () => {
  const todayAppointments = await Appointment.countDocuments({
    isDeleted: { $ne: true },
  });

  const totalPatients = await Patient.countDocuments({
    isDeleted: { $ne: true },
  });

  const checkedInPatients = await Appointment.countDocuments({
    isDeleted: { $ne: true },
    status: "IN_CONSULTATION",
  });

  const pendingAppointments = await Appointment.countDocuments({
    isDeleted: { $ne: true },
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

