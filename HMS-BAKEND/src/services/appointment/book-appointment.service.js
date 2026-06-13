const Appointment = require("../../models/Appointment");
const Employee = require("../../models/Employee");
const Patient = require("../../models/Patient");

const generateAppointmentId = require("../../utils/generateAppointmentId");

// ── Helpers ────────────────────────────────────────────────────────────────────

const resolvePatientId = async (appointmentData, user) => {
  if (appointmentData.patientId) return appointmentData.patientId;

  if (user.patientId) {
    const patient = await Patient.findOne({ patientId: user.patientId });
    if (patient) return patient._id;
  }

  const patient = await Patient.findOne({ userId: user.userId });
  if (!patient) throw new Error("Patient not found");
  return patient._id;
};

const validatePastDate = (appointmentDate) => {
  const selectedDate = new Date(appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  if (selectedDate < today) throw new Error("Cannot book appointment for past dates");
};

const validateDoctor = (doctor, appointmentDate, resolvedTime) => {
  if (!doctor?.availability?.isAvailable) {
    throw new Error("Doctor is currently unavailable");
  }

  const appointmentDay = new Date(appointmentDate)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toUpperCase();

  if (!doctor?.availability?.workingDays?.includes(appointmentDay)) {
    throw new Error(`Doctor is not available on ${appointmentDay}`);
  }

  const { breakStartTime, breakEndTime } = doctor?.availability ?? {};
  if (breakStartTime && breakEndTime && resolvedTime >= breakStartTime && resolvedTime < breakEndTime) {
    throw new Error("Selected slot falls during doctor break time");
  }
};

const normalizeDate = (appointmentDate) => {
  const [year, month, day] = appointmentDate.split("-").map(Number);
  const normalizedDate = new Date(year, month - 1, day, 12, 0, 0);
  const nextDay = new Date(normalizedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return { normalizedDate, nextDay };
};

const checkForConflicts = async (resolvedDoctorId, resolvedPatientId, resolvedTime, normalizedDate, nextDay, maxPatientsPerDay) => {
  const totalAppointments = await Appointment.countDocuments({
    doctorEmployeeId: resolvedDoctorId,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $ne: "CANCELLED" },
  });

  if (totalAppointments >= maxPatientsPerDay) {
    throw new Error("Maximum patient limit reached for this doctor");
  }

  const doctorSlotTaken = await Appointment.findOne({
    doctorEmployeeId: resolvedDoctorId,
    timeSlot: resolvedTime,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $nin: ["CANCELLED", "NO_SHOW"] },
  });

  if (doctorSlotTaken) throw new Error("Selected slot already booked");

  const patientSlotTaken = await Appointment.findOne({
    patientId: resolvedPatientId,
    timeSlot: resolvedTime,
    appointmentDate: { $gte: normalizedDate, $lt: nextDay },
    status: { $nin: ["CANCELLED", "NO_SHOW"] },
  });

  if (patientSlotTaken) throw new Error("Patient already has an appointment at this time");
};

// ── Main function ──────────────────────────────────────────────────────────────

const bookAppointment = async (appointmentData, user) => {
  const {
    doctorEmployeeId,
    doctorId,
    appointmentDate,
    timeSlot,
    appointmentTime,
    reason,
    notes,
    appointmentType,
    priority,
    paymentStatus,
    visitMode,
    symptoms,
  } = appointmentData;

  const resolvedDoctorId = doctorEmployeeId || doctorId;
  const resolvedTime = timeSlot || appointmentTime;

  const resolvedPatientId = await resolvePatientId(appointmentData, user);

  validatePastDate(appointmentDate);

  const patient = await Patient.findById(resolvedPatientId);
  if (!patient) throw new Error("Patient not found");

  const doctor = await Employee.findById(resolvedDoctorId);
  if (!doctor) throw new Error("Doctor not found");

  validateDoctor(doctor, appointmentDate, resolvedTime);

  const { normalizedDate, nextDay } = normalizeDate(appointmentDate);

  await checkForConflicts(
    resolvedDoctorId,
    resolvedPatientId,
    resolvedTime,
    normalizedDate,
    nextDay,
    doctor?.availability?.maxPatientsPerDay
  );

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
    createdByEmployeeId: user.employeeId || resolvedPatientId,
    status: "BOOKED",
    approvalStatus: isPatient ? "PENDING" : "APPROVED",
  });

  return appointment;
};

module.exports = bookAppointment;