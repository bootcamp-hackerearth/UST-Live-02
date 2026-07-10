const Employee = require("../../models/Employee");

const getRecentEmployeesService = async () => {
  return Employee.find({
    isDeleted: false,
  })
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
};

module.exports = getRecentEmployeesService;
