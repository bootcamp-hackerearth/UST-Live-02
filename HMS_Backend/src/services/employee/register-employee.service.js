const Employee = require("../../models/Employee");
const User = require("../../models/User");

const bcrypt = require("bcryptjs");

const EMPLOYEE_PREFIX = require("../../constants/employee-prefix");
const ROLES = require("../../constants/roles");
const STATUS = require("../../constants/status");

const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
const generateSequentialId = require("../../utils/generateSequentialId");
const ApiError = require("../../utils/ApiError");

const sendEmail = require("../../utils/sendEmail");
const employeeWelcomeTemplate = require("../../templates/employeeWelcometemplate");

const registerEmployee = async (employeeData, currentUser) => {
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
    securityAnswer: hashedSecurityAnswer,
  } = employeeData;

  // Super admin authorization
  if (
    designation === ROLES.ADMIN &&
    !currentUser.roles?.includes(ROLES.SUPER_ADMIN)
  ) {
    throw new ApiError(403, "Only Super Admin can create Admin", "FORBIDDEN");
  }

  // Check if email is already in use
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
    isDeleted: false,
  });

  if (existingUser) {
    throw new ApiError(
      409,
      "Employee already exists with this email",
      "EMAIL_ALREADY_EXISTS",
    );
  }

  // Check if phone number is already in use
  const existingPhone = await Employee.findOne({
    phone,
    isDeleted: false,
  });

  if (existingPhone) {
    throw new ApiError(
      409,
      "Employee already exists with this phone number",
      "PHONE_ALREADY_EXISTS",
    );
  }

  // Validate doctor's registration number
  if (designation === "DOCTOR") {
    const existingDoctor = await Employee.findOne({
      medicalRegistrationNo,
      isDeleted: false,
    });

    if (existingDoctor) {
      throw new ApiError(
        409,
        "Medical registration number already exists",
        "MEDICAL_REGISTRATION_EXISTS",
      );
    }
  }

  // Generate employee code
  const prefix = EMPLOYEE_PREFIX[designation];

  if (!prefix) {
    throw new ApiError(
      400,
      "Invalid employee designation",
      "INVALID_DESIGNATION",
    );
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
    createdBy: currentUser.userId,
  });

  // Generate temporary password for first login
  const temporaryPassword = generateTemporaryPassword();

  const hashedTemporaryPassword = await bcrypt.hash(temporaryPassword, 10);

  // Create user account
  await User.create({
    email: email.toLowerCase(),
    temporaryPasswordHash: hashedTemporaryPassword,
    roles: [designation],
    employeeId: employee._id,
    isFirstLogin: true,
    status: STATUS.ACTIVE,
    securityQuestion,
    securityAnswer: hashedSecurityAnswer,
    createdBy: currentUser.userId,
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
