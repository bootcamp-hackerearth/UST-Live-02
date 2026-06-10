const Employee = require("../../models/Employee");
const User = require("../../models/User");
const STATUS = require("../../constants/status");

const approveEmployeeService =
  async (
    employeeId,
    consultationFee
  ) => {

    const user =
      await User.findOne({
        employeeId,
      });

    if (!user) {
      throw new Error(
        "Employee account not found"
      );
    }

    const employee =
      await Employee.findById(
        employeeId
      );

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    if (
      employee.designation ===
        "DOCTOR" &&
      !consultationFee
    ) {
      throw new Error(
        "Consultation fee is required for doctors"
      );
    }

    if (
      employee.designation ===
      "DOCTOR"
    ) {
      employee.consultationFee =
        Number(
          consultationFee
        );
    }

    employee.status =
      STATUS.ACTIVE;

    user.status =
      STATUS.ACTIVE;

    await employee.save();
    await user.save();

    return employee;
  };

module.exports =
  approveEmployeeService;