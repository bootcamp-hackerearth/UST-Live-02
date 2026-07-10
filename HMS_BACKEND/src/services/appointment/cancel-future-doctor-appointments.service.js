const Appointment = require("../../models/Appointment");

const STATUS = require("../../constants/status");

const sendEmail = require("../../utils/sendEmail");

const appointmentCancelledTemplate = require("../../templates/appointment-cancelled.template");
const logger = require("../../utils/logger");

const cancelFutureDoctorAppointments = async (doctorEmployeeId, deletedBy) => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const appointments = await Appointment.find({
    doctorEmployeeId,
    appointmentDate: {
      $gte: today,
    },
    isDeleted: false,
    status: {
      $nin: [
        STATUS.CANCELLED,
        STATUS.COMPLETED,
        STATUS.REJECTED,
        STATUS.NO_SHOW,
      ],
    },
  }).populate("patientId");

  logger.info("Cancelling future appointments for inactive doctor", {
    doctorEmployeeId,
    count: appointments.length,
  });

  for (const appointment of appointments) {
    appointment.status = STATUS.CANCELLED;

    appointment.updatedBy = deletedBy;

    appointment.rejectedBy = deletedBy;

    appointment.rejectedDate = new Date();

    appointment.rejectionReason = "Doctor is no longer available.";

    await appointment.save();

    if (appointment.patientId?.email) {
      const htmlContent = appointmentCancelledTemplate({
        patientName: `${appointment.patientId.firstName} ${appointment.patientId.lastName}`,
        appointmentDate: appointment.appointmentDate
          .toISOString()
          .split("T")[0],
        appointmentTime: appointment.timeSlot,
        reason: "Doctor is no longer available.",
      });

      try {
        await sendEmail({
          to: appointment.patientId.email,
          subject: "Appointment Cancelled",
          htmlContent,
        });
      } catch (error) {
        logger.warn("Appointment cancellation email failed", {
          appointmentId: appointment._id,
          patientId: appointment.patientId?._id,
          error,
        });
      }
    }
  }

  return appointments.length;
};

module.exports = cancelFutureDoctorAppointments;
