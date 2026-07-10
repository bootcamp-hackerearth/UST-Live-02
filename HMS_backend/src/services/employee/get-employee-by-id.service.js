const Employee = require("../../models/Employee");
const ApiError = require("../../utils/ApiError");

const getEmployeeByIdService = async (id) => {
  const employee = await Employee.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!employee) {
    throw new ApiError(404, "Employee not found", "EMPLOYEE_NOT_FOUND");
  }

  return employee;
};

module.exports = getEmployeeByIdService;
