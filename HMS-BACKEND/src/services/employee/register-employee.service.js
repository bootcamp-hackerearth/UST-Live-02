const Employee = require("../../models/Employee");
const User = require("../../models/User");

const bcrypt = require("bcryptjs");

const EMPLOYEE_PREFIX = require("../../constants/employee-prefix");
const ROLES = require("../../constants/roles");
const STATUS = require("../../constants/status");

const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
const generateSequentialId = require("../../utils/generateSequentialId");

const sendEmail = require("../../utils/sendEmail");
const employeeWelcomeTemplate = require("../../templates/employeeWelcomeTemplate");

const registerEmployee = async (employeeData) => {
  const {
    name,
    email,
    phone,
    gender,
    department,
    designation,
    joiningDate,
    medicalRegistrationNo,
    specialization,
    qualification,
    consultationFee,
    availabilitySlots,
    workingDays,
    startTime,
    endTime,
    slotDuration,
    breakStartTime,
    breakEndTime,
    maxPatientsPerDay,
    securityQuestion,
    securityAnswer,
    role,
  } = employeeData;

  // Check if email is already in use
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("Employee already exists with this email");
  }

  // Check if phone number is already in use
  const existingPhone = await Employee.findOne({
    phone,
  });

  if (existingPhone) {
    throw new Error("Employee already exists with this phone number");
  }

  // Validate doctor's registration number
  if (designation === "DOCTOR") {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo,
    });

    if (existingDoctor) {
      throw new Error("Medical registration number already exists");
    }
  }

  // Generate employee code
  const prefix = EMPLOYEE_PREFIX[designation];

  if (!prefix) {
    throw new Error("Invalid employee designation");
  }

  const employeeCode = await generateSequentialId(prefix);

  // Create employee record
  const employee = await Employee.create({
    employeeCode,
    name,
    email: email.toLowerCase(),
    phone,
    department,
    gender,
    designation,
    joiningDate,
    medicalRegistrationNo,
    specialization,
    qualification,
    consultationFee,
    availabilitySlots,
    availability: {
      workingDays: workingDays || [],
      startTime,
      endTime,
      slotDuration: slotDuration || 15,
      breakStartTime,
      breakEndTime,
      maxPatientsPerDay: maxPatientsPerDay || 40,
    },
    status: STATUS.ACTIVE,
  });

  // Generate temporary password for first login
  const temporaryPassword = generateTemporaryPassword();

  const hashedTemporaryPassword = await bcrypt.hash(
    temporaryPassword,
    10
  );

  // Create user account
  await User.create({
    email: email.toLowerCase(),
    temporaryPasswordHash: hashedTemporaryPassword,
    roles: [role || designation || ROLES.DOCTOR],
    employeeId: employee._id,
    isFirstLogin: true,
    status: STATUS.ACTIVE,
    securityQuestion,
    securityAnswer,
  });

  // Send welcome email with login details
  const loginLink = `${process.env.FRONTEND_URL}/login`;

  const htmlContent = employeeWelcomeTemplate({
    name,
    email,
    employeeCode,
    temporaryPassword,
    loginLink,
  });

  await sendEmail({
    to: email,
    subject: "Welcome to HMS",
    htmlContent,
  });

  return {
    message: "Employee registered successfully",
    employee,
    temporaryPassword,
  };
};

module.exports = registerEmployee;