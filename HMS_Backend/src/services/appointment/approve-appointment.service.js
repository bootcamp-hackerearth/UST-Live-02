const Appointment =
require("../../models/Appointment");
const Patient =
require("../../models/Patient");

const Employee =
require("../../models/Employee");

const sendEmail =
require("../../utils/sendEmail");

const appointmentApprovedTemplate =
require("../../templates/appointment-approved.template");

const approveAppointment =
async (appointmentId) => {

  const appointment =
    await Appointment.findById(
      appointmentId
    );

  if (!appointment) {

    throw new Error(
      "Appointment not found"
    );
  }

  if (
    appointment.status !==
    "PENDING"
  ) {

    throw new Error(
      "Only pending appointments can be approved"
    );
  }

 // Generate Token number
 
  const todayAppointmentsCount =
    await Appointment.countDocuments({

      doctorEmployeeId:
        appointment.doctorEmployeeId,

      appointmentDate:
        appointment.appointmentDate,

      status: {
        $in: [
          "BOOKED",
          "IN_CONSULTATION",
          "COMPLETED",
        ],
      },
    });

  appointment.tokenNumber =
    todayAppointmentsCount + 1;

  appointment.status =
    "BOOKED";

  await appointment.save();
  const patient =
await Patient.findById(
  appointment.patientId
);

const doctor =
await Employee.findById(
  appointment.doctorEmployeeId
);

if (patient?.email) {

  const htmlContent =
    appointmentApprovedTemplate({

      patientName:
        `${patient.firstName} ${patient.lastName}`,

      doctorName:
        doctor?.name,

      appointmentDate:
        appointment.appointmentDate
          .toISOString()
          .split("T")[0],

      appointmentTime:
        appointment.timeSlot,

      tokenNumber:
        appointment.tokenNumber,
    });

  await sendEmail({
    to: patient.email,

    subject:
      "Appointment Approved",

    htmlContent,
  });
}

  return appointment;
};

module.exports =
  approveAppointment;