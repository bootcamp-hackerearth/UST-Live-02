const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");

const Employee = require("../../models/Employee");

const sendEmail = require("../../utils/sendEmail");

const appointmentRejectedTemplate = require("../../templates/appointment-rejected.template");
const ERR = require("../../utils/errors");

const rejectAppointment = async (appointmentId, rejectedBy) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
throw ERR.appointmentNotFound(); }

  if (appointment.status !== "PENDING") {
throw ERR.appointmentRejectConflict();}

  appointment.status = "REJECTED";
  appointment.rejectedBy = rejectedBy;
  appointment.rejectedDate = new Date();

  await appointment.save();
  const patient = await Patient.findById(appointment.patientId);

  const doctor = await Employee.findById(appointment.doctorEmployeeId);

  if (patient?.email) {
    const htmlContent = appointmentRejectedTemplate({
      patientName: `${patient.firstName} ${patient.lastName}`,

      doctorName: doctor?.name,

      appointmentDate: appointment.appointmentDate.toISOString().split("T")[0],

      appointmentTime: appointment.timeSlot,
    });

    await sendEmail({
      to: patient.email,

      subject: "Appointment Rejected",

      htmlContent,
    });
  }

  return appointment;
};

module.exports = rejectAppointment;

