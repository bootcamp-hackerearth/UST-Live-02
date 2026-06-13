const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const ROLES = require("../../constants/roles");
const STATUS = require("../../constants/status");

const validateEmployeeData = require("../../utils/validateEmployeeData");
const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
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

  const { employeeCode } = await validateEmployeeData({
    email,
    phone,
    designation,
    medicalRegistrationNo,
  });

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

  const temporaryPassword = generateTemporaryPassword();
  const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 10);

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