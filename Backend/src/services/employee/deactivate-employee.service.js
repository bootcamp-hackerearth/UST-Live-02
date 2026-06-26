const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ERR = require("../../utils/errors");

const deactivateEmployeeService = async (employeeId, deactivatedBy) => {
  const employee = await Employee.findOneAndUpdate(
    {
      _id: employeeId,
      isDeleted: { $ne: true },
    },
    {
      status: STATUS.INACTIVE,
      deactivatedBy,
      deactivatedDate: new Date(),
    },
    { new: true }
  );

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  await User.findOneAndUpdate(
    { employeeId },
    { status: STATUS.INACTIVE }
  );

  return employee;
};

module.exports = deactivateEmployeeService;

