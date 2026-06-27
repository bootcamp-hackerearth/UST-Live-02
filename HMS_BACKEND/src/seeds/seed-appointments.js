const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const Employee = require("../models/Employee");
const STATUS = require("../constants/status");

const TOTAL_APPOINTMENTS = 27;

const APPOINTMENT_TYPES = [
  "CONSULTATION",
  "FOLLOW_UP",
  "EMERGENCY",
  "VIDEO_CONSULTATION",
  "ROUTINE_CHECKUP",
];

const PRIORITIES = ["NORMAL", "URGENT", "CRITICAL"];
const PAYMENT_STATUSES = ["PENDING", "PAID", "INSURANCE"];
const VISIT_MODES = ["OFFLINE", "ONLINE", "HOME_VISIT"];

const SAMPLE_SYMPTOMS = [
  "Fever",
  "Headache",
  "Cough",
  "Cold",
  "Body pain",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Sore throat",
  "Stomach ache",
];

// ---------- helpers ----------

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomSymptoms = () => {
  const count = Math.floor(Math.random() * 3); // 0,1,2 symptoms
  const chosen = new Set();
  while (chosen.size < count) {
    chosen.add(randomItem(SAMPLE_SYMPTOMS));
  }
  return Array.from(chosen);
};

// Spread appointments across a window of days: some past, today, some future
const randomAppointmentDate = () => {
  const offsetDays = Math.floor(Math.random() * 21) - 10; // -10 .. +10 days
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(0, 0, 0, 0);
  return date;
};

// 15-minute slots between 09:00 and 17:00, matching Employee default slotDuration
const randomTimeSlot = () => {
  const startHour = 9;
  const endHour = 17;
  const totalSlots = (endHour - startHour) * 4; // 4 slots/hour
  const slotIndex = Math.floor(Math.random() * totalSlots);

  const hour = startHour + Math.floor(slotIndex / 4);
  const minute = (slotIndex % 4) * 15;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const isPastDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// ---------- main ----------

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in your .env file");
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

async function getLastSequenceForCurrentMonth(prefix) {
  const latestAppointment = await Appointment.findOne({
    appointmentId: { $regex: `^${prefix}` },
  }).sort({ appointmentId: -1 });

  if (!latestAppointment) return 0;

  return Number.parseInt(latestAppointment.appointmentId.slice(-5), 10);
}

function buildAppointmentId(prefix, sequence) {
  return `${prefix}${String(sequence).padStart(5, "0")}`;
}

async function fetchDoctors() {
  const doctors = await Employee.find({
    designation: "DOCTOR",
    status: STATUS.ACTIVE,
    isDeleted: false,
  });

  if (!doctors.length) {
    throw new Error(
      "No active, non-deleted doctors (designation: 'DOCTOR') found. Seed some Employees first."
    );
  }
  return doctors;
}

async function fetchPatients() {
  const patients = await Patient.find({ isDeleted: false });

  if (!patients.length) {
    throw new Error("No patients found. Seed some Patients first.");
  }
  return patients;
}

async function fetchReceptionist() {
  // Used for createdByEmployeeId, mimicking a receptionist booking the appointment
  const receptionist = await Employee.findOne({
    designation: "RECEPTIONIST",
    status: STATUS.ACTIVE,
    isDeleted: false,
  });
  return receptionist; // may be null; handled by caller
}

async function seedAppointments() {
  await connectDB();

  const doctors = await fetchDoctors();
  const patients = await fetchPatients();
  const receptionist = await fetchReceptionist();

  if (!receptionist) {
    console.warn(
      "No active Receptionist Employee found — createdByEmployeeId will be left null for all seeded appointments."
    );
  }

  // Track token numbers per doctor+date combo for this run
  // key: `${doctorId}_${dateString}` -> next token number
  const tokenTracker = new Map();

  // Track appointmentId sequence per month prefix for this run
  // key: prefix (e.g. APT-2606) -> next sequence number
  const sequenceTracker = new Map();

  const appointmentsToInsert = [];

  for (let i = 0; i < TOTAL_APPOINTMENTS; i++) {
    const doctor = randomItem(doctors);
    const patient = randomItem(patients);
    const appointmentDate = randomAppointmentDate();
    const timeSlot = randomTimeSlot();

    // --- appointmentId ---
    const year = String(appointmentDate.getFullYear()).slice(-2);
    const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
    const prefix = `APT-${year}${month}`;

    if (!sequenceTracker.has(prefix)) {
      const lastSeq = await getLastSequenceForCurrentMonth(prefix);
      sequenceTracker.set(prefix, lastSeq);
    }
    const nextSeq = sequenceTracker.get(prefix) + 1;
    sequenceTracker.set(prefix, nextSeq);
    const appointmentId = buildAppointmentId(prefix, nextSeq);

    // --- tokenNumber (per doctor + date) ---
    const dateKey = appointmentDate.toISOString().slice(0, 10);
    const tokenKey = `${doctor._id}_${dateKey}`;
    const nextToken = (tokenTracker.get(tokenKey) || 0) + 1;
    tokenTracker.set(tokenKey, nextToken);

    // --- status (past appointments are COMPLETED, future/today are BOOKED) ---
    const status = isPastDate(appointmentDate) ? STATUS.COMPLETED : STATUS.BOOKED;

    appointmentsToInsert.push({
      appointmentId,
      patientId: patient._id,
      doctorEmployeeId: doctor._id,
      appointmentDate,
      timeSlot,
      tokenNumber: nextToken,
      status,
      appointmentType: randomItem(APPOINTMENT_TYPES),
      priority: randomItem(PRIORITIES),
      paymentStatus: randomItem(PAYMENT_STATUSES),
      visitMode: randomItem(VISIT_MODES),
      symptoms: randomSymptoms(),
      createdByEmployeeId: receptionist ? receptionist._id : null,
      createdByPatientId: null,
      isDeleted: false,
    });
  }

  const inserted = await Appointment.insertMany(appointmentsToInsert);
  console.log(`Inserted ${inserted.length} appointments.`);

  inserted.forEach((appt) => {
    console.log(
      `  ${appt.appointmentId} | ${appt.appointmentDate.toISOString().slice(0, 10)} ${appt.timeSlot} | Token #${appt.tokenNumber} | ${appt.status}`
    );
  });
}

seedAppointments()
  .then(() => {
    console.log("Seeding complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });