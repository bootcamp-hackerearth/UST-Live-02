const User = require("../models/User");
const Employee = require("../models/Employee");

const EMPLOYEE_PREFIX = require("../constants/employee-prefix");

const generateSequentialId = require("../utils/generateSequentialId");

const validateEmployeeData = async ({ email, phone, designation, medicalRegistrationNo }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new Error("Email is already registered");

  const existingPhone = await Employee.findOne({ phone });
  if (existingPhone) throw new Error("Phone number is already registered");

  if (designation === "DOCTOR") {
    const existingDoctor = await Employee.findOne({ medicalRegistrationNo });
    if (existingDoctor) throw new Error("Medical registration number already exists");
  }

  const prefix = EMPLOYEE_PREFIX[designation];
  if (!prefix) throw new Error("Invalid designation");

  const employeeCode = await generateSequentialId(prefix);

  return { employeeCode };
};

module.exports = validateEmployeeData;