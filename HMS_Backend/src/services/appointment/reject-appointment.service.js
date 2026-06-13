const Appointment =
require("../../models/Appointment");
const Patient =
require("../../models/Patient");

const Employee =
require("../../models/Employee");

const sendEmail =
require("../../utils/sendEmail");

const appointmentRejectedTemplate =
require("../../templates/appointment-rejected.template");

const rejectAppointment =
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
      "Only pending appointments can be rejected"
    );
  }

  appointment.status =
    "REJECTED";

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
    appointmentRejectedTemplate({

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
    });

  await sendEmail({
    to: patient.email,

    subject:
      "Appointment Rejected",

    htmlContent,
  });
}

  return appointment;
};

module.exports =
  rejectAppointment;