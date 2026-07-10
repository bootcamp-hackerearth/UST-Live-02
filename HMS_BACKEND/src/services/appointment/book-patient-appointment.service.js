const Appointment = require("../../models/Appointment");
const STATUS = require("../../constants/status");
const generateAppointmentId = require("../../utils/generateAppointmentId");
const validateAppointmentBooking = require("../../utils/validateAppointmentBooking");

const bookPatientAppointment = async (appointmentData, user) => {
  const {
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
    notes,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    symptoms,
  } = appointmentData;

  const patientId = user.patientId;

  await validateAppointmentBooking({ patientId, doctorId, appointmentDate, appointmentTime });

  const appointmentId = await generateAppointmentId();

  const appointment = await Appointment.create({
    appointmentId,
    patientId,
    doctorEmployeeId: doctorId,
    appointmentDate,
    timeSlot: appointmentTime,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    symptoms,
    reason,
    notes,
    tokenNumber: null,
    createdByPatientId: user.patientId,
    status: STATUS.PENDING,
  });

  return appointment;
};

module.exports = bookPatientAppointment;
