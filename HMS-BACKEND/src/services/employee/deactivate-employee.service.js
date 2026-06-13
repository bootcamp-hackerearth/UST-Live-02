const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");

const deactivateEmployeeService =
  async (employeeId) => {

    await User.findOneAndUpdate(
      { employeeId },
      { status: STATUS.INACTIVE }
    );

    return Employee.findByIdAndUpdate(
      employeeId,
      { status: STATUS.INACTIVE },
      { new: true }
    );
  };

module.exports =
  deactivateEmployeeService;