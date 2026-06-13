const Patient =
require("../../models/Patient");

const Appointment =
require("../../models/Appointment");

const getPatientDashboard =
async (patientId) => {

  const patient =
    await Patient.findById(
      patientId
    );

  if (!patient) {

    throw new Error(
      "Patient not found"
    );
  }

  const pendingCount =
    await Appointment.countDocuments({

      patientId,

      status:
        "PENDING",
    });

  const bookedCount =
    await Appointment.countDocuments({

      patientId,

      status:
        "BOOKED",
    });

  const completedCount =
    await Appointment.countDocuments({

      patientId,

      status:
        "COMPLETED",
    });

  const cancelledCount =
    await Appointment.countDocuments({

      patientId,

      status:
        "CANCELLED",
    });

  const upcomingAppointment =
    await Appointment.findOne({

      patientId,

      status: {
        $in: [
          "PENDING",
          "BOOKED",
        ],
      },
    })

      .populate(
        "doctorEmployeeId"
      )

      .sort({
        appointmentDate: 1,
      });

  return {

    patient: {

      firstName:
        patient.firstName,

      lastName:
        patient.lastName,

      patientId:
        patient.patientId,
    },

    appointmentSummary: {

      pending:
        pendingCount,

      booked:
        bookedCount,

      completed:
        completedCount,

      cancelled:
        cancelledCount,
    },

    upcomingAppointment,
  };
};

module.exports =
  getPatientDashboard;