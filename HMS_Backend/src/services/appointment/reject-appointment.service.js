const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");
const Employee = require("../../models/Employee");

const STATUS = require("../../constants/status");

const sendEmail = require("../../utils/sendEmail");
const appointmentRejectedTemplate = require("../../templates/appointment-rejected.template");
const ApiError = require("../../utils/ApiError");

const rejectAppointment = async (
  appointmentId,
  rejectedBy,
  rejectionReason = null,
) => {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    isDeleted: false,
  });

  if (!appointment) {
    throw new ApiError(404, "Appointment not found", "APPOINTMENT_NOT_FOUND");
  }

  if (appointment.status !== STATUS.PENDING) {
    throw new ApiError(
      400,
      "Only pending appointments can be rejected",
      "INVALID_APPOINTMENT_STATUS",
    );
  }

  appointment.status = STATUS.REJECTED;

  appointment.rejectedBy = rejectedBy;

  appointment.rejectedDate = new Date();

  appointment.rejectionReason = rejectionReason;

  await appointment.save();

  const patient = await Patient.findOne({
    _id: appointment.patientId,
    isDeleted: false,
  });

  const doctor = await Employee.findOne({
    _id: appointment.doctorEmployeeId,
    isDeleted: false,
  });

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
