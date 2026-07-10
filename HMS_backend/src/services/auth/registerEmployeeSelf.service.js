const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const STATUS = require("../../constants/status");
const EMPLOYEE_PREFIX = require("../../constants/employee-prefix");

const generateSequentialId = require("../../utils/generateSequentialId");
const sendEmail = require("../../utils/sendEmail");
const ApiError = require("../../utils/ApiError");
const ROLES = require("../../constants/roles");
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

  if (designation === ROLES.ADMIN) {
    throw new ApiError(403, "Admin cannot self register", "FORBIDDEN");
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered", "CONFLICT");
  }

  const existingPhone = await Employee.findOne({
    phone,
    isDeleted: false,
  });

  if (existingPhone) {
    throw new ApiError(409, "Phone number is already registered", "CONFLICT");
  }

  if (designation === "DOCTOR" && medicalRegistrationNo) {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo,
      isDeleted: false,
    });

    if (existingDoctor) {
      throw new ApiError(
        409,
        "Medical registration number already exists",
        "CONFLICT",
      );
    }
  }

  const prefix = EMPLOYEE_PREFIX[designation];

  if (!prefix) {
    throw new ApiError(400, "Invalid designation", "BAD_REQUEST");
  }

  const employeeCode = await generateSequentialId(prefix);

  const hashedPassword = await bcrypt.hash(password, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10,
  );

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
    createdBy: null,
  });

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
