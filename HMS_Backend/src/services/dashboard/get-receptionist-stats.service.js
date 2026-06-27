const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");
const STATUS = require("../../constants/status");
const getReceptionistStatsService = async () => {
  const todayAppointments = await Appointment.countDocuments({
    isDeleted: false,
  });

  const totalPatients = await Patient.countDocuments({
    isDeleted: false,
  });

  const checkedInPatients = await Appointment.countDocuments({
    status: STATUS.IN_CONSULTATION,

    isDeleted: false,
  });

  const pendingAppointments = await Appointment.countDocuments({
    status: STATUS.BOOKED,

    isDeleted: false,
  });

  return {
    todayAppointments,
    totalPatients,
    checkedInPatients,
    pendingAppointments,
  };
};

module.exports = getReceptionistStatsService;
