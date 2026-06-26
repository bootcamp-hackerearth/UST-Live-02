const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ERR = require("../../utils/errors");

const rejectEmployeeService = async (employeeId, rejectedBy) => {
  const employee = await Employee.findOneAndUpdate(
    {
      _id: employeeId,
      isDeleted: { $ne: true },
    },
    {
      status: STATUS.REJECTED,
      rejectedBy,
      rejectedDate: new Date(),
    },
    { new: true }
  );

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  await User.findOneAndUpdate(
    { employeeId },
    { status: STATUS.REJECTED }
  );

  return employee;
};

module.exports = rejectEmployeeService;

