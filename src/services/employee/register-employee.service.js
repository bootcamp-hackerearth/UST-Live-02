const Employee = require("../../models/Employee");
const User = require("../../models/User");
const EMPLOYEE_PREFIX = require("../../constants/employee-prefix");
const bcrypt = require("bcryptjs");
const ROLES = require("../../constants/roles");
const STATUS = require("../../constants/status");
const generateTemporaryPassword = require("../../utils/generateTemporaryPassword");
const generateSequentialId = require("../../utils/generateSequentialId");

// employee registration
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

 // existing user check
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("Employee already exists with this email");
  }


  const prefix = EMPLOYEE_PREFIX[designation];

  if (!prefix) {
    throw new Error("Invalid employee designation");
  }

// employee code generation
  const employeeCode = await generateSequentialId(prefix);
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

// generate temporary password
  const temporaryPassword = generateTemporaryPassword();
  console.log(temporaryPassword);
  const hashedTemporaryPassword = await bcrypt.hash(  temporaryPassword,  10);

// create user account
  await User.create({
    email: email.toLowerCase(),
    temporaryPasswordHash: hashedTemporaryPassword,
    roles: [role],
    employeeId: employee._id,
    isFirstLogin: true,
    status: STATUS.ACTIVE,
    securityQuestion,
    securityAnswer,
  });
return {message: "Employee registered successfully", temporaryPassword, employee};
};

module.exports = registerEmployee;
