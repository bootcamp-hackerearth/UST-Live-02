const ApiError = require("../utils/ApiError");
const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const Employee = require("../models/employee.model");
const Role = require("../models/role.model");
const jwt = require("../utils/jwt");
const generateId = require("../utils/idGenerator");

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
  console.log("parsed userdata : ", userData);
  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new ApiError(404, "Role not found");
  }
  const roleId = role._id;
  console.log("parsed role and ", role);
  console.log("creating user");
  const user = await createAuthUser({
    firstName,
    lastName,
    email,
    password,
    phone,
    roleId,
  });
  console.log(user);
  const EMPID = await generateId(role.roleCode);
  console.log(user);
  const userId = user._id;
  const employee = await createEmployee({
    userId,
    EMPID,
    department,
    designation,
    status: true,
  });
  const token = generateVerificationToken(userId);
  await sendVerificationEmail(
    token,
    email,
    "http://localhost:3000/api/auth/verify",
  );
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
  console.log("user created");
  return user;
};

const createEmployee = async (employeeData) => {
  const {
    userId,
    EMPID,
    department,
    designation,
    status = true,
  } = employeeData;
  console.log("user id ", userId);
  const employee = await Employee.create({
    userId,
    employeeCode: EMPID,
    department,
    designation,
    status,
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
const sendVerificationEmail = async (token, email, url) => {
  const verifyUrl = `${url}?token=${token}`;
  console.log(`click this link to verify `, verifyUrl);
};
module.exports = {
  createUser,
  createAuthUser,
  createEmployee,
  generateVerificationToken,
  sendVerificationEmail,
};
