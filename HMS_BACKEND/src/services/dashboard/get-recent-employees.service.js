const Employee = require("../../models/Employee");

const getRecentEmployeesService = async () => {
  return Employee.find({
    isDeleted: { $ne: true },
  })
    .sort({
      createdAt: -1,
    })
    .limit(5);
};

module.exports = getRecentEmployeesService;

