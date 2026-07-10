const Appointment = require("../../models/Appointment");
const getNextTokenNumber = require("../../utils/getNextTokenNumber");
const generateAppointmentId = require("../../utils/generateAppointmentId");
const ApiError = require("../../utils/ApiError");
const validateAppointmentBooking = require("../../utils/validateAppointmentBooking");

const bookAppointment = async (appointmentData, user) => {
  const {
    patientId,
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

  const { doctor, selectedDate } = await validateAppointmentBooking({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
  });

  // Prevent booking before the doctor's joining date
  if (doctor.joiningDate) {
    const joiningDate = new Date(doctor.joiningDate);
    joiningDate.setHours(0, 0, 0, 0);
    if (selectedDate < joiningDate) {
      throw new ApiError(
        400,
        "Appointment date cannot be before the doctor's joining date",
        "APPOINTMENT_BEFORE_JOINING_DATE",
      );
    }
  }

  const appointmentId = await generateAppointmentId();
  const tokenNumber = await getNextTokenNumber(doctorId, appointmentDate);

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
    tokenNumber,
    createdByEmployeeId: user.employeeId,
    status: "BOOKED",
  });

  return appointment;
};

module.exports = bookAppointment;
