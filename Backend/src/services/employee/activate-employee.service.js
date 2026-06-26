const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ERR = require("../../utils/errors");

const activateEmployeeService = async (employeeId, activatedBy) => {
  const employee = await Employee.findOneAndUpdate(
    {
      _id: employeeId,
      isDeleted: { $ne: true },
    },
    {
      status: STATUS.ACTIVE,
      activatedBy,
      activatedDate: new Date(),
    },
    { new: true }
  );

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  await User.findOneAndUpdate(
    { employeeId },
    { status: STATUS.ACTIVE }
  );

  return employee;
};

module.exports = activateEmployeeService;

