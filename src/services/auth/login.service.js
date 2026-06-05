const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");
const generateToken = require("../../utils/generateToken");
const loginUser = async (loginData) => {
const { loginId, password } = loginData;

  let user = null;

  const isEmailLogin = loginId.includes("@");

// Login using email
  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
    });
  } else {
   
// Login using employee code
    const employee = await Employee.findOne({
      employeeCode: loginId,
    });

    if (!employee) {
      throw new Error("Invalid credentials");
    }

    user = await User.findOne({
      employeeId: employee._id,
    });
  }
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (user.status !== "ACTIVE") {
  throw new Error("Account is inactive");
  }


  let isPasswordValid = false;

 // First login
  if (user.isFirstLogin) {
    console.log("FIRST LOGIN");

    console.log(user.temporaryPasswordHash);

    isPasswordValid = await bcrypt.compare(
      password,

      user.temporaryPasswordHash,
    );
  } else {

    // Normal login
    console.log("NORMAL LOGIN");
    console.log(user.passwordHash);
    isPasswordValid = await bcrypt.compare( password,user.passwordHash);
  }

// invalid password
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  //Generate Token
  const tokenPayload = {
    userId: user._id,
    employeeId: user.employeeId,
    roles: user.roles,
  };
  const token = generateToken(tokenPayload);

  // last login
  user.lastLoginAt = new Date();
  await user.save();

  return {token,user: { email: user.email, isFirstLogin: user.isFirstLogin, roles: user.roles, employeeId: user.employeeId }};
};

module.exports = loginUser;
