const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const ERR = require("../../utils/errors");
const generateAppointmentId = require("../../utils/generateAppointmentId");
const ensureDoctorJoined = require("./ensure-doctor-joined.service");

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
throw ERR.pastAppointmentDate();  }

  // Verify patient exists
  const patient = await Patient.findOne({
    _id: patientId,
    isDeleted: { $ne: true },
  });

  if (!patient) {
throw ERR.patientNotFound();  }

  // Verify doctor exists
  const doctor = await Employee.findOne({
    _id: doctorId,
    isDeleted: { $ne: true },
  });

  if (!doctor) {
throw ERR.doctorNotFound();
  }

  ensureDoctorJoined(doctor, appointmentDate);

  // Check if doctor is currently available
  if (!doctor?.availability?.isAvailable) {
throw ERR.doctorUnavailable();
  }

  // Ensure appointment is on a doctor's working day
  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", {
      weekday: "long",
    })
    .toUpperCase();

  if (!doctor?.availability?.workingDays?.includes(appointmentDay)) {
throw ERR.doctorNotAvailableOnDay(appointmentDay);
  }

  // Prevent booking during break hours
  const breakStartTime = doctor?.availability?.breakStartTime;
  const breakEndTime = doctor?.availability?.breakEndTime;

  if (breakStartTime && breakEndTime) {
    if (appointmentTime >= breakStartTime && appointmentTime < breakEndTime) {
throw ERR.doctorBreakTime();
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
    isDeleted: { $ne: true },
    appointmentDate: {
      $gte: normalizedDate,
      $lt: nextDay,
    },
    status: {
      $ne: "CANCELLED",
    },
  });

  if (totalAppointments >= doctor?.availability?.maxPatientsPerDay) {
throw ERR.doctorPatientLimitReached();
  }

  // Prevent double-booking of doctor slot
  const existingAppointment = await Appointment.findOne({
    doctorEmployeeId: doctorId,
    isDeleted: { $ne: true },
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
throw ERR.slotAlreadyBooked();
  }

  // Prevent patient from booking multiple appointments at same time
  const existingPatientAppointment = await Appointment.findOne({
    patientId,
    isDeleted: { $ne: true },
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
throw ERR.patientAlreadyHasAppointment();  }

  // Generate unique appointment ID
  const appointmentId = await generateAppointmentId();

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

