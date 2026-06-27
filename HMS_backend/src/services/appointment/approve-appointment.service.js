const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");

const Employee = require("../../models/Employee");

const sendEmail = require("../../utils/sendEmail");

const appointmentApprovedTemplate = require("../../templates/appointment-approved.template");
const ERR = require("../../utils/errors");
const getNextTokenNumber = require("./get-next-token-number.service");

const approveAppointment = async (appointmentId, approvedBy) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: { $ne: true },
  });

  if (!appointment) {
throw ERR.appointmentNotFound();  }

  if (appointment.status !== "PENDING") {
throw ERR.appointmentApprovalConflict();  }

  // Generate Token number
  appointment.tokenNumber = await getNextTokenNumber(
    appointment.doctorEmployeeId,
    appointment.appointmentDate
  );

  appointment.status = "BOOKED";
  appointment.approvedBy = approvedBy;
  appointment.approvedDate = new Date();
  appointment.rejectedBy = null;
  appointment.rejectedDate = null;

  await appointment.save();
  const patient = await Patient.findById(appointment.patientId);

  const doctor = await Employee.findById(appointment.doctorEmployeeId);

  if (patient?.email) {
    const htmlContent = appointmentApprovedTemplate({
      patientName: `${patient.firstName} ${patient.lastName}`,

      doctorName: doctor?.name,

      appointmentDate: appointment.appointmentDate.toISOString().split("T")[0],

      appointmentTime: appointment.timeSlot,

      tokenNumber: appointment.tokenNumber,
    });

    await sendEmail({
      to: patient.email,

      subject: "Appointment Approved",

      htmlContent,
    });
  }

  return appointment;
};

module.exports = approveAppointment;

