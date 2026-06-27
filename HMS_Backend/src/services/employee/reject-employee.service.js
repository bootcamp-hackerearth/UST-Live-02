const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");

const rejectEmployeeService = async (
  employeeId,
  rejectedBy,
  rejectionReason = null,
) => {
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
    throw new ApiError(404, "Employee account not found", "USER_NOT_FOUND");
  }

  employee.status = STATUS.REJECTED;

  employee.rejectedBy = rejectedBy;

  employee.rejectedDate = new Date();

  employee.rejectionReason = rejectionReason;

  user.status = STATUS.REJECTED;

  await employee.save();
  await user.save();

  return employee;
};

module.exports = rejectEmployeeService;
