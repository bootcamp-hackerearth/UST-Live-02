const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");

const rejectEmployeeService =
  async (employeeId) => {

    await User.findOneAndUpdate(
      { employeeId },
      { status: STATUS.REJECTED }
    );

    return Employee.findByIdAndUpdate(
      employeeId,
      {
        status: STATUS.REJECTED,
      },
      { new: true }
    );
  };

module.exports =
  rejectEmployeeService;