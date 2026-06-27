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
const ERR = require("../../utils/errors");

const registerEmployee = async (employeeData, currentUser = {}) => {
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
  const selectedRole = role || designation || ROLES.DOCTOR;

  if (selectedRole === ROLES.SUPER_ADMIN) {
    throw ERR.unauthorizedAccess();
  }

  if (
    selectedRole === ROLES.ADMIN &&
    !currentUser.roles?.includes(ROLES.SUPER_ADMIN)
  ) {
    throw ERR.unauthorizedAccess();
  }

  // Check if email is already in use
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
throw ERR.employeeEmailExists();
  }
  // Check if phone number is already in use
  const existingPhone = await Employee.findOne({
    phone,
  });

  if (existingPhone) {
throw ERR.employeePhoneExists();
  }
  // Validate doctor's registration number
  if (designation === "DOCTOR") {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo,
    });

    if (existingDoctor) {
throw ERR.medicalRegistrationExists();
      }  }

  // Generate employee code
  const prefix = EMPLOYEE_PREFIX[designation];

  if (!prefix) {
throw ERR.invalidDesignation();
  }
  const employeeCode = await generateSequentialId(prefix);
  const employeePayload = {
    employeeCode,
    name,
    email: email.toLowerCase(),
    phone,
    department,
    gender,
    designation,
    joiningDate,
    status: STATUS.ACTIVE,
  };

  if (designation === ROLES.DOCTOR) {
    employeePayload.medicalRegistrationNo = medicalRegistrationNo;
    employeePayload.specialization = specialization;
    employeePayload.qualification = qualification;
    employeePayload.consultationFee = consultationFee;
    employeePayload.availabilitySlots = availabilitySlots;
    employeePayload.availability = {
      workingDays: workingDays || [],
      startTime,
      endTime,
      slotDuration: slotDuration || 15,
      breakStartTime,
      breakEndTime,
      maxPatientsPerDay: maxPatientsPerDay || 40,
    };
  }

  // Create employee record
  const employee = await Employee.create(employeePayload);

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
    roles: [selectedRole],
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
