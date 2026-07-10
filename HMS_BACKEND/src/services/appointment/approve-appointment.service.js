const Appointment = require("../../models/Appointment");
const Patient = require("../../models/Patient");
const Employee = require("../../models/Employee");

const STATUS = require("../../constants/status");
const getNextTokenNumber = require("../../utils/getNextTokenNumber");
const sendEmail = require("../../utils/sendEmail");
const appointmentApprovedTemplate = require("../../templates/appointment-approved.template");
const ApiError = require("../../utils/ApiError");

const approveAppointment = async (appointmentId, approvedBy) => {
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
      "Only pending appointments can be approved",
      "INVALID_APPOINTMENT_STATUS",
    );
  }

  // Generate Token number
  appointment.tokenNumber = await getNextTokenNumber(
    appointment.doctorEmployeeId,
    appointment.appointmentDate,
  );

  appointment.status = "BOOKED";
  appointment.approvedBy = approvedBy;
  appointment.approvedDate = new Date();
  appointment.rejectedBy = null;
  appointment.rejectedDate = null;

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
