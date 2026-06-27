const Patient = require("../../models/Patient");

const Appointment = require("../../models/Appointment");
const ERR = require("../../utils/errors");

const getPatientDashboard = async (patientId) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: { $ne: true },
  });

  if (!patient) {
throw ERR.patientNotFound();
  }
  const pendingCount = await Appointment.countDocuments({
    patientId,
    isDeleted: { $ne: true },

    status: "PENDING",
  });

  const bookedCount = await Appointment.countDocuments({
    patientId,
    isDeleted: { $ne: true },

    status: "BOOKED",
  });

  const completedCount = await Appointment.countDocuments({
    patientId,
    isDeleted: { $ne: true },

    status: "COMPLETED",
  });

  const cancelledCount = await Appointment.countDocuments({
    patientId,
    isDeleted: { $ne: true },

    status: "CANCELLED",
  });

  const upcomingAppointment = await Appointment.findOne({
    patientId,
    isDeleted: { $ne: true },

    status: {
      $in: ["PENDING", "BOOKED"],
    },
  })

    .populate("doctorEmployeeId")

    .sort({
      appointmentDate: 1,
    });

  return {
    patient: {
      firstName: patient.firstName,

      lastName: patient.lastName,

      patientId: patient.patientId,
    },

    appointmentSummary: {
      pending: pendingCount,

      booked: bookedCount,

      completed: completedCount,

      cancelled: cancelledCount,
    },

    upcomingAppointment,
  };
};

module.exports = getPatientDashboard;

