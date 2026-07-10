const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");

const deactivateEmployeeService = async (employeeId, userId) => {
  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  const user = await User.findOne({
    employeeId,
    isDeleted: false,
  });

  if (!user) {
    throw new ApiError(404, "User account not found", "USER_NOT_FOUND");
  }

  employee.status = STATUS.INACTIVE;
  employee.updatedBy = userId;

  user.status = STATUS.INACTIVE;

  await employee.save();
  await user.save();

  return employee;
};

module.exports = deactivateEmployeeService;
