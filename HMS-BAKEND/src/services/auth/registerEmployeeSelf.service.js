const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const STATUS = require("../../constants/status");

const validateEmployeeData = require("../../utils/validateEmployeeData");
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

  const { employeeCode } = await validateEmployeeData({
    email,
    phone,
    designation,
    medicalRegistrationNo,
  });

  const hashedPassword = await bcrypt.hash(password, 10);
  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10
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
    to: email,
    subject: "Registration Submitted – Pending Approval",
    htmlContent,
  });

  return {
    message: "Registration submitted successfully. Wait for admin approval.",
  };
};

module.exports = registerEmployeeSelf;