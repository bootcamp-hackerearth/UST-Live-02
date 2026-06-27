const Patient = require("../../models/Patient");
const ApiError = require("../../utils/ApiError");
const Appointment = require("../../models/Appointment");
const STATUS = require("../../constants/status");

const getPatientDashboard = async (patientId) => {
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  const baseFilter = {
    patientId,
    isDeleted: false,
  };

  const pendingCount = await Appointment.countDocuments({
    ...baseFilter,
    status: STATUS.PENDING,
  });

  const bookedCount = await Appointment.countDocuments({
    ...baseFilter,
    status: STATUS.BOOKED,
  });

  const completedCount = await Appointment.countDocuments({
    ...baseFilter,
    status: STATUS.COMPLETED,
  });

  const cancelledCount = await Appointment.countDocuments({
    ...baseFilter,
    status: STATUS.CANCELLED,
  });

  const upcomingAppointment = await Appointment.findOne({
    ...baseFilter,

    status: {
      $in: [STATUS.PENDING, STATUS.BOOKED],
    },
  })
    .populate({
      path: "doctorEmployeeId",

      select: "name department specialization",

      match: {
        isDeleted: false,
      },
    })
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
