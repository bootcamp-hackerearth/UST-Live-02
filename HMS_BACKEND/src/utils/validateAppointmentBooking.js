const Appointment = require("../models/Appointment");
const Employee = require("../models/Employee");
const Patient = require("../models/Patient");
const ApiError = require("./ApiError");

const validateAppointmentBooking = async ({
  patientId,
  doctorId,
  appointmentDate,
  appointmentTime,
}) => {
  const selectedDate = new Date(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new ApiError(
      422,
      "Cannot book appointment for past dates",
      "PAST_DATE_NOT_ALLOWED",
    );
  }

  const patient = await Patient.findOne({ _id: patientId, isDeleted: false });
  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  const doctor = await Employee.findOne({ _id: doctorId, isDeleted: false });
  if (!doctor) {
    throw new ApiError(404, "Doctor not found", "DOCTOR_NOT_FOUND");
  }

  if (!doctor?.availability?.isAvailable) {
    throw new ApiError(
      400,
      "Doctor is currently unavailable",
      "DOCTOR_UNAVAILABLE",
    );
  }

  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  if (!doctor?.availability?.workingDays?.includes(appointmentDay)) {
    throw new ApiError(
      400,
      `Doctor is not available on ${appointmentDay}`,
      "DOCTOR_NOT_AVAILABLE_ON_DAY",
    );
  }

  const breakStartTime = doctor?.availability?.breakStartTime;
  const breakEndTime = doctor?.availability?.breakEndTime;

  if (
    breakStartTime &&
    breakEndTime &&
    appointmentTime >= breakStartTime &&
    appointmentTime < breakEndTime
  ) {
    throw new ApiError(
      400,
      "Selected slot falls during doctor break time",
      "SLOT_DURING_BREAK_TIME",
    );
  }

  const [year, month, day] = appointmentDate.split("-").map(Number);
  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);
  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId: doctorId,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $ne: "CANCELLED" },
    isDeleted: false,
  });

  if (totalAppointments >= doctor?.availability?.maxPatientsPerDay) {
    throw new ApiError(
      400,
      "Maximum patient limit reached for this doctor",
      "DOCTOR_DAILY_LIMIT_REACHED",
    );
  }

  const existingAppointment = await Appointment.findOne({
    doctorEmployeeId: doctorId,
    timeSlot: appointmentTime,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $nin: ["CANCELLED", "NO_SHOW"] },
    isDeleted: false,
  });

  if (existingAppointment) {
    throw new ApiError(409, "Selected slot already booked", "SLOT_ALREADY_BOOKED");
  }

  const existingPatientAppointment = await Appointment.findOne({
    patientId,
    timeSlot: appointmentTime,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $nin: ["CANCELLED", "NO_SHOW"] },
    isDeleted: false,
  });

  if (existingPatientAppointment) {
    throw new ApiError(
      409,
      "Patient already has an appointment at this time",
      "PATIENT_APPOINTMENT_CONFLICT",
    );
  }

  return { doctor, patient, normalizedDate, nextDay, selectedDate };
};

module.exports = validateAppointmentBooking;
