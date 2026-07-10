const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");

const getPendingEmployeesService = async () => {
  return Employee.find({
    status: STATUS.PENDING,
    isDeleted: false,
  })
    .select("employeeCode name email department designation createdAt")
    .sort({
      createdAt: -1,
    })
    .lean();
};

module.exports = getPendingEmployeesService;
