const Employee = require("../../models/Employee");

const getEmployeeByIdService = async (id) => {
  return Employee.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });
};

module.exports = getEmployeeByIdService;

