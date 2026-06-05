const User = require("../models/User");
const Employee = require("../models/Employee");

const findUserByLoginId = async (
  loginId,
  notFoundMessage = "User not found",
) => {
  let user = null;

  const isEmailLogin = loginId.includes("@");

  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
    });
  } else {
    const employee = await Employee.findOne({
      employeeCode: loginId,
    });

    if (!employee) {
      throw new Error("Invalid login ID");
    }

    user = await User.findOne({
      employeeId: employee._id,
    });
  }

  if (!user) {
    throw new Error(notFoundMessage);
  }

  return user;
};

module.exports = findUserByLoginId;
