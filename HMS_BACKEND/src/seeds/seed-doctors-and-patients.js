const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const Patient = require("../models/Patient");
const STATUS = require("../constants/status");
const EMPLOYEE_PREFIX = require("../constants/employee-prefix");
const generateSequentialId = require("../utils/generateSequentialId");
const generatePatientId = require("../utils/generatePatientId");

const TOTAL_DOCTORS = 3;
const TOTAL_PATIENTS = 15;

const DEPARTMENTS = ["CARDIOLOGY", "ORTHOPEDICS", "NEUROLOGY", "PEDIATRICS", "GENERAL_MEDICINE"];
const QUALIFICATIONS = [
  ["MBBS"],
  ["MBBS", "MD"],
  ["MBBS", "MS"],
  ["MBBS", "MD", "DM"],
];
const SPECIALIZATIONS = [
  "Cardiologist",
  "Orthopedic Surgeon",
  "Neurologist",
  "Pediatrician",
  "General Physician",
];

const FIRST_NAMES_MALE = ["Arjun", "Vikram", "Rahul", "Karthik", "Suresh", "Manoj", "Praveen", "Ajay"];
const FIRST_NAMES_FEMALE = ["Priya", "Divya", "Sneha", "Anjali", "Kavya", "Meena", "Lakshmi", "Pooja"];
const LAST_NAMES = ["Kumar", "Sharma", "Iyer", "Nair", "Reddy", "Menon", "Pillai", "Rao"];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["MALE", "FEMALE", "OTHER"];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED"];
const PATIENT_TYPES = ["OPD", "IPD", "EMERGENCY"];
const CITIES = ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"];
const STATES_LIST = ["Tamil Nadu"];

// ---------- helpers ----------

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomDigits = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
};

// Generates a unique-ish 10-digit Indian-style phone number starting with 9, 8, 7, or 6
const usedPhones = new Set();
const randomPhone = () => {
  let phone;
  do {
    const firstDigit = randomItem(["9", "8", "7", "6"]);
    phone = firstDigit + randomDigits(9);
  } while (usedPhones.has(phone));
  usedPhones.add(phone);
  return phone;
};

const randomDateOfBirth = (minAge, maxAge) => {
  const age = minAge + Math.floor(Math.random() * (maxAge - minAge));
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  date.setMonth(Math.floor(Math.random() * 12));
  date.setDate(1 + Math.floor(Math.random() * 28));
  return date;
};

const randomJoiningDate = () => {
  // Sometime in the last 3 years
  const date = new Date();
  date.setFullYear(date.getFullYear() - Math.floor(Math.random() * 3));
  date.setMonth(Math.floor(Math.random() * 12));
  date.setDate(1 + Math.floor(Math.random() * 28));
  return date;
};

const randomFullName = () => {
  const isMale = Math.random() < 0.5;
  const firstName = isMale ? randomItem(FIRST_NAMES_MALE) : randomItem(FIRST_NAMES_FEMALE);
  const lastName = randomItem(LAST_NAMES);
  return { firstName, lastName, gender: isMale ? "MALE" : "FEMALE" };
};

const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

// ---------- DB connection ----------

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not defined in your .env file");
  }
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
}

// ---------- doctor creation ----------

async function createDoctors() {
  const createdDoctors = [];

  for (let i = 0; i < TOTAL_DOCTORS; i++) {
    const { firstName, lastName, gender } = randomFullName();
    const fullName = `${firstName} ${lastName}`;

    const employeeCode = await generateSequentialId(EMPLOYEE_PREFIX.DOCTOR);
    const phone = randomPhone();
    const emailSlug = slugify(`${firstName}.${lastName}.${employeeCode}`);
    const department = randomItem(DEPARTMENTS);

    const doctor = new Employee({
      employeeCode,
      name: fullName,
      gender,
      countryCode: "+91",
      phone,
      email: `${emailSlug}@hms-demo.com`,
      department,
      designation: "DOCTOR",
      joiningDate: randomJoiningDate(),
      medicalRegistrationNo: `MCI-${randomDigits(6)}`,
      specialization: randomItem(SPECIALIZATIONS),
      qualification: randomItem(QUALIFICATIONS),
      status: STATUS.ACTIVE,
      isDeleted: false,
      consultationFee: 300 + Math.floor(Math.random() * 700),
      availability: {
        workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 15,
        breakStartTime: "13:00",
        breakEndTime: "14:00",
        maxPatientsPerDay: 40,
        isAvailable: true,
      },
    });

    await doctor.save();
    createdDoctors.push(doctor);
  }

  return createdDoctors;
}

// ---------- patient creation ----------

async function createPatients() {
  const createdPatients = [];

  for (let i = 0; i < TOTAL_PATIENTS; i++) {
    const { firstName, lastName, gender } = randomFullName();
    const patientId = await generatePatientId();
    const phone = randomPhone();
    const emailSlug = slugify(`${firstName}.${lastName}.${patientId}`);

    const patient = new Patient({
      patientId,
      firstName,
      lastName,
      dateOfBirth: randomDateOfBirth(5, 85),
      gender,
      bloodGroup: randomItem(BLOOD_GROUPS),
      maritalStatus: randomItem(MARITAL_STATUSES),
      countryCode: "+91",
      phone,
      email: `${emailSlug}@hms-demo.com`,
      address: `${1 + Math.floor(Math.random() * 200)}, Main Street`,
      city: randomItem(CITIES),
      state: randomItem(STATES_LIST),
      pincode: String(600000 + Math.floor(Math.random() * 20000)),
      country: "India",
      emergencyContactName: `${randomItem(FIRST_NAMES_MALE)} ${randomItem(LAST_NAMES)}`,
      emergencyContactPhone: randomPhone(),
      relationship: randomItem(["Father", "Mother", "Spouse", "Sibling", "Friend"]),
      allergies: [],
      chronicDiseases: [],
      currentMedications: [],
      pastSurgeries: [],
      patientType: randomItem(PATIENT_TYPES),
      status: "ACTIVE",
      isDeleted: false,
    });

    await patient.save();
    createdPatients.push(patient);
  }

  return createdPatients;
}

// ---------- main ----------

async function seedDoctorsAndPatients() {
  await connectDB();

  console.log(`Creating ${TOTAL_DOCTORS} doctors...`);
  const doctors = await createDoctors();
  doctors.forEach((d) => {
    console.log(`  ${d.employeeCode} | ${d.name} | ${d.department} | phone=${d.phone}`);
  });

  console.log(`Creating ${TOTAL_PATIENTS} patients...`);
  const patients = await createPatients();
  patients.forEach((p) => {
    console.log(`  ${p.patientId} | ${p.firstName} ${p.lastName} | phone=${p.phone}`);
  });

  console.log(`Done. Created ${doctors.length} doctors and ${patients.length} patients.`);
}

seedDoctorsAndPatients()
  .then(() => {
    console.log("Seeding complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });