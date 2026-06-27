const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");
const ApiError = require("../../utils/ApiError");

const approveEmployeeService = async (
  employeeId,
  consultationFee,
  approvedBy,
) => {
  const user = await User.findOne({
    employeeId,
    isDeleted: false,
  });

  if (!user) {
    throw new ApiError(404, "Employee account not found", "USER_NOT_FOUND");
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  if (employee.designation === "DOCTOR" && !consultationFee) {
    throw new ApiError(
      400,
      "Consultation fee is required for doctors",
      "CONSULTATION_FEE_REQUIRED",
    );
  }

  if (employee.designation === "DOCTOR") {
    employee.consultationFee = Number(consultationFee);
  }

  employee.status = STATUS.ACTIVE;
  employee.approvedBy = approvedBy;
  employee.approvalDate = new Date();

  employee.rejectedBy = null;
  employee.rejectedDate = null;
  employee.rejectionReason = null;

  user.status = STATUS.ACTIVE;

  await employee.save();
  await user.save();

  return employee;
};

module.exports = approveEmployeeService;
