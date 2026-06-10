const Employee = require("../../models/Employee");

const getRecentEmployeesService = async () => {
  return Employee.find()
    .sort({
      createdAt: -1,
    })
    .limit(5);
};

module.exports = getRecentEmployeesService;
