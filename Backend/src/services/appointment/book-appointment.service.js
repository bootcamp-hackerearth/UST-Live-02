const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");
const User = require("../../models/User");
const mongoose = require("mongoose");

const generateAppointmentId = require("../../utils/generateAppointmentId");

const getPatientLookupForUser = async (user) => {
  const dbUser = await User.findById(user.userId);

  return {
    $or: [
    ...(mongoose.Types.ObjectId.isValid(user.patientObjectId)
      ? [{ _id: user.patientObjectId }]
      : []),
    { patientId: user.patientId },
    { userId: user.userId },
    { user: user.userId },
    { email: user.email },
    ...(dbUser
      ? [
          { patientId: dbUser.patientId },
          { userId: dbUser._id },
          { user: dbUser._id },
          { email: dbUser.email },
        ]
      : []),
    ],
  };
};

const bookAppointment = async (appointmentData, user) => {
  const {
    doctorEmployeeId,
    doctorId, // fallback for web
    appointmentDate,
    timeSlot,
    appointmentTime, // fallback for web
    reason,
    notes,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    symptoms,
  } = appointmentData;

  // Support both field names (mobile sends doctorEmployeeId, web sends doctorId)
  const resolvedDoctorId = doctorEmployeeId || doctorId;

  // Support both field names (mobile sends timeSlot, web sends appointmentTime)
  const resolvedTime = timeSlot || appointmentTime;

  // ── Resolve patientId ──────────────────────────────────────────────────────
  // Web (ADMIN/RECEPTIONIST) sends patientId (MongoDB _id) explicitly.
  // Mobile (PATIENT role) does NOT — look up via the token's patientId string
  // (e.g. "PAT-001") or fall back to userId → Patient lookup.
  let resolvedPatientId = appointmentData.patientId;

  if (!resolvedPatientId) {
    const patient = await Patient.findOne(await getPatientLookupForUser(user));

    // token has patientId = "PAT-001" (the string ID) — use it to find the doc
    if (user.patientId) {
      // Patient lookup is handled above.
    }

    // fallback: look up by userId (User._id stored in Patient.userId)
    if (!patient) {
      // Patient lookup is handled above.
    }

    if (!patient) throw new Error("Patient not found");
    resolvedPatientId = patient._id; // MongoDB ObjectId for the Appointment doc
  }

  // ── Past date check ────────────────────────────────────────────────────────
  const selectedDate = new Date(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    throw new Error("Cannot book appointment for past dates");
  }

  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  if (isToday) {
    const [slotHours, slotMinutes] = resolvedTime.split(":").map(Number);
    const slotTotalMinutes = slotHours * 60 + slotMinutes;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    if (slotTotalMinutes <= currentTotalMinutes) {
      throw new Error("Cannot book appointment for past time slots");
    }
  }

  // ── Verify patient exists ──────────────────────────────────────────────────
  const patientLookup = [
    { patientId: resolvedPatientId },
    { userId: resolvedPatientId },
    { user: resolvedPatientId },
  ];

  if (mongoose.Types.ObjectId.isValid(resolvedPatientId)) {
    patientLookup.push({ _id: resolvedPatientId });
  }

  const patient = await Patient.findOne({ $or: patientLookup });
  if (!patient) throw new Error("Patient not found");
  resolvedPatientId = patient._id;

  // ── Verify doctor exists ───────────────────────────────────────────────────
  const doctor = await Employee.findById(resolvedDoctorId);
  if (!doctor) throw new Error("Doctor not found");

  // ── Doctor availability checks ────────────────────────────────────────────
  if (!doctor?.availability?.isAvailable) {
    throw new Error("Doctor is currently unavailable");
  }

  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  const workingDays = doctor?.availability?.workingDays || [];
  const normalizedWorkingDays = workingDays.map((day) => day.toUpperCase());

  if (!normalizedWorkingDays.includes(appointmentDay)) {
    throw new Error(`Doctor is not available on ${appointmentDay}`);
  }

  // ── Break time check ───────────────────────────────────────────────────────
  const breakStartTime = doctor?.availability?.breakStartTime;
  const breakEndTime = doctor?.availability?.breakEndTime;

  if (breakStartTime && breakEndTime) {
    if (resolvedTime >= breakStartTime && resolvedTime < breakEndTime) {
      throw new Error("Selected slot falls during doctor break time");
    }
  }

  // ── Normalize date ─────────────────────────────────────────────────────────
  const [year, month, day] = appointmentDate.split("-").map(Number);
  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);
  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // ── Daily limit check ──────────────────────────────────────────────────────
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId: resolvedDoctorId,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $ne: "CANCELLED" },
  });

  if (totalAppointments >= doctor?.availability?.maxPatientsPerDay) {
    throw new Error("Maximum patient limit reached for this doctor");
  }

  // ── Double-booking check ───────────────────────────────────────────────────
  const existingAppointment = await Appointment.findOne({
    doctorEmployeeId: resolvedDoctorId,
    timeSlot: resolvedTime,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $nin: ["CANCELLED", "NO_SHOW"] },
  });

  if (existingAppointment) throw new Error("Selected slot already booked");

  // ── Patient double-booking check ───────────────────────────────────────────
  const existingPatientAppointment = await Appointment.findOne({
    patientId: resolvedPatientId,
    timeSlot: resolvedTime,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $nin: ["CANCELLED", "NO_SHOW"] },
  });

  if (existingPatientAppointment) {
    throw new Error("Patient already has an appointment at this time");
  }

  // ── Create appointment ─────────────────────────────────────────────────────
  const appointmentId = await generateAppointmentId();

  const todayAppointmentsCount = await Appointment.countDocuments({
    doctorEmployeeId: resolvedDoctorId,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
  });

  const tokenNumber = todayAppointmentsCount + 1;

  const isPatient = Array.isArray(user.roles) && user.roles.includes("PATIENT");

  const appointment = await Appointment.create({
    appointmentId,
    patientId: resolvedPatientId,
    doctorEmployeeId: resolvedDoctorId,
    appointmentDate,
    timeSlot: resolvedTime,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    symptoms,
    reason,
    notes,
    tokenNumber,
    // For patients booking via mobile, use their patientId's ObjectId as creator.
    // For staff (ADMIN/RECEPTIONIST), user.employeeId holds the Employee ObjectId.
    createdByEmployeeId: user.employeeId || resolvedPatientId,
    status: "BOOKED",
    approvalStatus: isPatient ? "PENDING" : "APPROVED",
  });

  return appointment;
};

module.exports = bookAppointment;
