const Employee = require("../../models/Employee");

const getEmployeeByIdService = async (id) => {
  return Employee.findById(id);
};

module.exports = getEmployeeByIdService;