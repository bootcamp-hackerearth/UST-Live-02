const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Employee = require("../models/employee.model");
const Role = require("../models/role.model");
const generateId = require("../utils/idGenerator");
const jwt = require("../utils/jwt");
const Doctor = require("../models/doctor.model");

const createUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    roleName,
    department,
    designation,
  } = userData;
  const role = await Role.findOne({ name: roleName });
  const roleId = role._id;
  const user = await createAuthUser({
    firstName,
    lastName,
    email,
    password,
    phone,
    roleId,
  });
  const roleCode = await role.roleCode;
  const EMPID = await generateId(roleCode);
  const userId = user._id;
  const employee = await createEmployee({
    userId,
    EMPID,
    department,
    designation,
  });
  const token = generateVerificationToken(userId);
  await sendVerificationEmail(token);
  return {
    EMPID: employee.employeeCode,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    department: employee.department,
    designation: employee.designation,
    joiningDate: employee.joiningDate,
  };
};
const createAuthUser = async (userAuthData) => {
  const { firstName, lastName, email, password, phone, roleId } = userAuthData;
  const existingUser = await User.findOne({ email: userAuthData.email });
  if (existingUser) {
    throw new ApiError(409, "User already exists with this email");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    passwordHash,
    roleId,
  });
  return user;
};
const createEmployee = async (employeeData) => {
  const { userId, EMPID, department, designation } = employeeData;
  const employee = await Employee.create({
    userId,
    employeeCode: EMPID,
    department,
    designation,
    status: false,
    joiningDate: Date.now(),
  });
  return employee;
};
const generateVerificationToken = (userId) => {
  return jwt.generateToken({
    payload: {
      userId,
    },
    type: jwt.tokenType.VERIFY_EMAIL,
  });
};
const sendVerificationEmail = async (token) => {
  const verifyUrl = `http://localhost:3000/api/auth/verify?token=${token}`;
  console.log(`click this link to verify `, verifyUrl);
};
module.exports = {
  createUser,
  createAuthUser,
  createEmployee,
  generateVerificationToken,
  sendVerificationEmail,
};
