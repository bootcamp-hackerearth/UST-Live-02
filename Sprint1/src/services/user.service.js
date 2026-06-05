const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Employee = require("../models/employee.model");
const Role = require("../models/role.model");
const generateId = require("../utils/idGenerator");
const jwt = require("../utils/jwt");

const createUser = async (userData) => {
  const { user, employee } = await createEmployeeUser(userData);

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

const createEmployeeUser = async (data) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    roleName,
    department,
    designation,
  } = data;

  const role = await Role.findOne({ name: roleName });

  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  const user = await createAuthUser({
    firstName,
    lastName,
    email,
    password,
    phone,
    roleId: role._id,
  });

  const EMPID = await generateId(role.roleCode);

  const employee = await createEmployee({
    userId: user._id,
    EMPID,
    department,
    designation,
  });

  const token = generateVerificationToken(user._id);
  await sendVerificationEmail(token);

  return {
    user,
    employee,
  };
};

const createAuthUser = async (userAuthData) => {
  const { firstName, lastName, email, password, phone, roleId } =
    userAuthData;

  const existingUser = await User.findOne({ email });

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

  console.log("Click this link to verify:", verifyUrl);
};

module.exports = {
  createUser,
  createEmployeeUser,
  createAuthUser,
  createEmployee,
  generateVerificationToken,
  sendVerificationEmail,
};