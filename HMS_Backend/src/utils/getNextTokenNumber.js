const Appointment = require("../models/Appointment");
const logger = require("./logger");

const getDateRange = (appointmentDate) => {
  const date = new Date(appointmentDate);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  return {
    startOfDay,
    endOfDay,
  };
};

const getNextTokenNumber = async (doctorEmployeeId, appointmentDate) => {
  logger.debug("Calculating next appointment token number", {
    doctorEmployeeId,
    appointmentDate,
    parsedAppointmentDate: new Date(appointmentDate),
  });

  const { startOfDay, endOfDay } = getDateRange(appointmentDate);

  const latestAppointment = await Appointment.findOne({
    doctorEmployeeId,
    isDeleted: { $ne: true },
    appointmentDate: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
    tokenNumber: {
      $ne: null,
    },
    status: {
      $nin: ["CANCELLED", "NO_SHOW", "REJECTED"],
    },
  }).sort({ tokenNumber: -1 });

  return (latestAppointment?.tokenNumber || 0) + 1;
};

module.exports = getNextTokenNumber;
