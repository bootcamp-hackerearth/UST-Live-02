const User = require("../../models/User");
const Employee = require("../../models/Employee");

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const employee = await Employee.findById(user.employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  return {
    user,
    employee,
  };
};

module.exports = getCurrentUser;
