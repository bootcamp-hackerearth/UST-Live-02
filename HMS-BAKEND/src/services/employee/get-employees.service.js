const Employee = require("../../models/Employee");

const getEmployeesService = async () => {
  return Employee.find();
};

module.exports = getEmployeesService;