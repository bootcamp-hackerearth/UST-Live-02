const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ERR = require("../../utils/errors");

const approveEmployeeService = async (
  employeeId,
  consultationFee,
  approvedBy,
) => {
  const user = await User.findOne({
    employeeId,
  });

  if (!user) {
    throw ERR.employeeAccountNotFound();
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: { $ne: true },
  });

  if (!employee) {
    throw ERR.employeeNotFound();
  }

  if (employee.designation === "DOCTOR" && !consultationFee) {
    throw ERR.consultationFeeRequired();
  }
  if (employee.designation === "DOCTOR") {
    employee.consultationFee = Number(consultationFee);
  }

  employee.status = STATUS.ACTIVE;
  employee.approvedBy = approvedBy;
  employee.approvedDate = new Date();
  employee.rejectedBy = null;
  employee.rejectedDate = null;

  user.status = STATUS.ACTIVE;

  await employee.save();
  await user.save();

  return employee;
};

module.exports = approveEmployeeService;

