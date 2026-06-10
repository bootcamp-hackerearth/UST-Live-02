const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");

const activateEmployeeService =
  async (employeeId) => {

    await User.findOneAndUpdate(
      { employeeId },
      { status: STATUS.ACTIVE }
    );

    return Employee.findByIdAndUpdate(
      employeeId,
      { status: STATUS.ACTIVE },
      { new: true }
    );
  };

module.exports =
  activateEmployeeService;