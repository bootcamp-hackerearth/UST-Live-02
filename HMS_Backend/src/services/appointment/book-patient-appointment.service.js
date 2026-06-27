const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const STATUS = require("../../constants/status");
const generateAppointmentId = require("../../utils/generateAppointmentId");
const ApiError = require("../../utils/ApiError");

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

  // Prevent booking appointments for past dates
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

  // Verify patient exists
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: false,
  });

  if (!patient) {
    throw new ApiError(404, "Patient not found", "PATIENT_NOT_FOUND");
  }

  // Verify doctor exists
  const doctor = await Employee.findOne({
    _id: doctorId,
    isDeleted: false,
  });

  if (!doctor) {
    throw new ApiError(404, "Doctor not found", "DOCTOR_NOT_FOUND");
  }

  // Check if doctor is currently available
  if (!doctor?.availability?.isAvailable) {
    throw new ApiError(
      400,
      "Doctor is currently unavailable",
      "DOCTOR_UNAVAILABLE",
    );
  }

  // Ensure appointment is on a doctor's working day
  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  if (!doctor?.availability?.workingDays?.includes(appointmentDay)) {
    throw new ApiError(
      400,
      `Doctor is not available on ${appointmentDay}`,
      "DOCTOR_NOT_AVAILABLE_ON_DAY",
    );
  }

  // Prevent booking during break hours
  const breakStartTime = doctor?.availability?.breakStartTime;
  const breakEndTime = doctor?.availability?.breakEndTime;

  if (breakStartTime && breakEndTime) {
    if (appointmentTime >= breakStartTime && appointmentTime < breakEndTime) {
      throw new ApiError(
        400,
        "Selected slot falls during doctor break time",
        "SLOT_DURING_BREAK_TIME",
      );
    }
  }

  // Normalize date for daily queries
  const [year, month, day] = appointmentDate.split("-").map(Number);

  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);

  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // Check doctor's daily appointment limit
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId: doctorId,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $ne: "CANCELLED",
    },
    isDeleted: false,
  });

  if (totalAppointments >= doctor?.availability?.maxPatientsPerDay) {
    throw new ApiError(
      400,
      "Maximum patient limit reached for this doctor",
      "DOCTOR_DAILY_LIMIT_REACHED",
    );
  }

  // Prevent double-booking of doctor slot
  const existingAppointment = await Appointment.findOne({
    doctorEmployeeId: doctorId,
    timeSlot: appointmentTime,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $nin: ["CANCELLED", "NO_SHOW"],
    },
    isDeleted: false,
  });

  if (existingAppointment) {
    throw new ApiError(
      409,
      "Selected slot already booked",
      "SLOT_ALREADY_BOOKED",
    );
  }

  // Prevent patient from booking multiple appointments at same time
  const existingPatientAppointment = await Appointment.findOne({
    patientId,
    timeSlot: appointmentTime,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $nin: ["CANCELLED", "NO_SHOW"],
    },
    isDeleted: false,
  });

  if (existingPatientAppointment) {
    throw new ApiError(
      409,
      "Patient already has an appointment at this time",
      "PATIENT_APPOINTMENT_CONFLICT",
    );
  }

  // Generate unique appointment ID
  const appointmentId = await generateAppointmentId();

  // Generate queue token number
  const todayAppointmentsCount = await Appointment.countDocuments({
    doctorEmployeeId: doctorId,
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    isDeleted: false,
  });

  const tokenNumber = todayAppointmentsCount + 1;

  // Create appointment record
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
