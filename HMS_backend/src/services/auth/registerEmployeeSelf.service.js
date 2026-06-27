const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const STATUS = require("../../constants/status");
const EMPLOYEE_PREFIX = require("../../constants/employee-prefix");
const ROLES = require("../../constants/roles");

const generateSequentialId = require("../../utils/generateSequentialId");
const sendEmail = require("../../utils/sendEmail");

const pendingApprovalTemplate = require("../../templates/pendingApprovalTemplate");
const ERR = require("../../utils/errors");

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
throw ERR.emailExists();  }

  // Check if phone number is already registered
  const existingPhone = await Employee.findOne({
    phone,
  });

  if (existingPhone) {
throw ERR.phoneExists();  }

  // Check doctor registration number
  if (designation === ROLES.DOCTOR) {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo,
    });

    if (existingDoctor) {
throw ERR.medicalRegistrationExists();    }
  }

  // Generate employee code
  const prefix = EMPLOYEE_PREFIX[designation];

  if (!prefix) {
throw ERR.invalidDesignation();  }

  const employeeCode = await generateSequentialId(prefix);

  // Hash password and security answer
  const hashedPassword = await bcrypt.hash(password, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10,
  );

  // Create employee record
  const employeePayload = {
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
    consultationFee,
    status: STATUS.PENDING,
  };

  if (designation === ROLES.DOCTOR) {
    employeePayload.medicalRegistrationNo = medicalRegistrationNo;
  }

  const employee = await Employee.create(employeePayload);

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
