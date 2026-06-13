const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");

const generateAppointmentId = require("../../utils/generateAppointmentId");

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

const patientId =
  user.patientId;

  // Prevent booking appointments for past dates
  const selectedDate = new Date(appointmentDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new Error("Cannot book appointment for past dates");
  }

  // Verify patient exists
  const patient = await Patient.findById(patientId);

  if (!patient) {
    throw new Error("Patient not found");
  }

  // Verify doctor exists
  const doctor = await Employee.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // Check if doctor is currently available
  if (!doctor?.availability?.isAvailable) {
    throw new Error("Doctor is currently unavailable");
  }

  // Ensure appointment is on a doctor's working day
  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  if (!doctor?.availability?.workingDays?.includes(appointmentDay)) {
    throw new Error(`Doctor is not available on ${appointmentDay}`);
  }

  // Prevent booking during break hours
  const breakStartTime = doctor?.availability?.breakStartTime;
  const breakEndTime = doctor?.availability?.breakEndTime;

  if (breakStartTime && breakEndTime) {
    if (appointmentTime >= breakStartTime && appointmentTime < breakEndTime) {
      throw new Error("Selected slot falls during doctor break time");
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
  });

  if (totalAppointments >= doctor?.availability?.maxPatientsPerDay) {
    throw new Error("Maximum patient limit reached for this doctor");
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
  });

  if (existingAppointment) {
    throw new Error("Selected slot already booked");
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
  });

  if (existingPatientAppointment) {
    throw new Error("Patient already has an appointment at this time");
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
    status: "PENDING",
  });

  return appointment;
};

module.exports = bookPatientAppointment;