const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const STATUS = require("../../constants/status");
const EMPLOYEE_PREFIX = require("../../constants/employee-prefix");

const generateSequentialId = require("../../utils/generateSequentialId");
const sendEmail = require("../../utils/sendEmail");

const pendingApprovalTemplate = require("../../templates/pendingApprovalTemplate");

const registerEmployeeSelf = async (employeeData) => {
  const {
    name,
    email,
    gender,
    phone,
    department,
    designation,
    joiningDate,
    qualification,
    specialization,
    medicalRegistrationNo,
    consultationFee,
    password,
    securityQuestion,
    securityAnswer,
  } = employeeData;

  // Check if email is already registered
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("Email is already registered");
  }

  // Check if phone number is already registered
  const existingPhone = await Employee.findOne({
    phone,
  });

  if (existingPhone) {
    throw new Error("Phone number is already registered");
  }

  // Check doctor registration number
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
    throw new Error("Invalid designation");
  }

  const employeeCode = await generateSequentialId(prefix);

  // Hash password and security answer
  const hashedPassword = await bcrypt.hash(password, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10
  );

  // Create employee record
  const employee = await Employee.create({
    employeeCode,
    name,
    email: email.toLowerCase(),
    phone,
    gender,
    department,
    designation,
    joiningDate,
    qualification,
    specialization,
    medicalRegistrationNo,
    consultationFee,
    status: STATUS.PENDING,
  });

  // Create user account
  await User.create({
    email: email.toLowerCase(),
    passwordHash: hashedPassword,
    roles: [designation],
    employeeId: employee._id,
    status: STATUS.PENDING,
    isFirstLogin: false,
    securityQuestion,
    securityAnswer: hashedSecurityAnswer,
  });

  // Notify admin about pending approval
  const htmlContent = pendingApprovalTemplate({
    name,
    email,
    designation,
    department,
  });

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: "New Employee Registration Pending Approval",
    htmlContent,
  });

  return {
    message: "Registration submitted successfully. Wait for admin approval.",
  };
};

module.exports = registerEmployeeSelf;