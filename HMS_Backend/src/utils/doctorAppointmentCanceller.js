const Appointment = require("../models/Appointments");
const Patient = require("../models/Patients");
const sendMail = require("./mailClient");
const emailTemplates = require("./emailTemplates");
const writeAuditLog = require("./auditLogger");

async function cancelAppointmentsForDoctor(employeeCode, doctorName, actor) {
  const appointments = await Appointment.find({ doctorEmployeeId: employeeCode, status: "BOOKED" });
  if (!appointments.length) return;

  const cancellationReason = "Doctor no longer available in the hospital";

  await Appointment.updateMany(
    { doctorEmployeeId: employeeCode, status: "BOOKED" },
    { status: "CANCELED", cancellationReason }
  );

  for (const appointment of appointments) {
    try {
      await writeAuditLog({
        actor,
        action: "APPOINTMENT_CANCELED",
        targetType: "APPOINTMENT",
        targetId: appointment.appointmentId,
        message: `Appointment ${appointment.appointmentId} was cancelled due to deletion of doctor ${doctorName} (${employeeCode}). Reason: ${cancellationReason}`,
      });
    } catch (error_) {
      console.error(`Audit log failed for appointment ${appointment.appointmentId}:`, error_);
    }

    try {
      const patient = await Patient.findOne({ UHID: appointment.patientId }).select("name email");
      if (patient?.email) {
        await sendMail({
          to: patient.email,
          ...emailTemplates.appointmentCanceled({
            patientName: patient.name,
            doctorName,
            appointmentDate: appointment.appointmentDate,
            timeSlot: appointment.timeSlot,
            cancellationReason,
          }),
        });
      }
    } catch (error_) {
      console.error(`Email failed for appointment ${appointment.appointmentId}:`, error_);
    }
  }
}

module.exports = cancelAppointmentsForDoctor;