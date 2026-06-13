const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Employee = require("../models/Employee");

const sendEmail = require("../utils/sendEmail");

const appointmentApprovedTemplate = require("../templates/appointmentApprovedTemplate");
const appointmentRejectedTemplate = require("../templates/appointmentRejectedTemplate");

const approveAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (!appointment.patientId || !appointment.doctorEmployeeId) {
      return res.status(400).json({
        success: false,
        message: "Appointment data is incomplete",
      });
    }

    appointment.approvalStatus = "APPROVED";

    await appointment.save();

    // Fetch patient and doctor details
    const patient = await Patient.findById(appointment.patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const doctor = await Employee.findById(appointment.doctorEmployeeId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Send approval email
    if (patient?.email) {
      await sendEmail({
        to: patient.email,
        subject: "Appointment Approved",

        htmlContent: appointmentApprovedTemplate({
          patientName: `${patient.firstName} ${patient.lastName}`,
          appointmentId: appointment.appointmentId,
          appointmentDate: new Date(
            appointment.appointmentDate,
          ).toLocaleDateString(),
          timeSlot: appointment.timeSlot,
          doctorName: `${doctor?.firstName || ""} ${doctor?.lastName || ""}`,
        }),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment approved successfully",
      data: appointment,
      updateApplied: true,
    });
  } catch (err) {
    console.error("APPROVE APPOINTMENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const rejectAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.approvalStatus = "REJECTED";

    await appointment.save();

    // Fetch patient details
    const patient = await Patient.findById(appointment.patientId);

    // Send rejection email
    if (patient?.email) {
      await sendEmail({
        to: patient.email,
        subject: "Appointment Rejected",

        htmlContent: appointmentRejectedTemplate({
          patientName: `${patient.firstName} ${patient.lastName}`,
          appointmentId: appointment.appointmentId,
        }),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment rejected successfully",
      data: appointment,
    });
  } catch (err) {
    console.error("REJECT APPOINTMENT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  approveAppointment,
  rejectAppointment,
};
