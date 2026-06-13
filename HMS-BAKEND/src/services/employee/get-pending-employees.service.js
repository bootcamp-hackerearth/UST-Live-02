const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getPendingEmployeesService =
  async () => {

    return Employee.find({
      status: STATUS.PENDING,
    });
  };

module.exports =
  getPendingEmployeesService;