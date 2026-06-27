const Employee = require("../../models/Employee");
const STATUS = require("../../constants/status");
const { buildSearchFilter } = require("../../utils/pagination");

const getPendingEmployeesService = async ({ skip, limit, sort, search }) => {
  const filter = {
    status: STATUS.PENDING,
    isDeleted: { $ne: true },
  };

  if (search) {
    Object.assign(
      filter,
      buildSearchFilter(
        ["employeeCode", "name", "phone", "email", "department", "designation"],
        search
      )
    );
  }

  const total = await Employee.countDocuments(filter);

  const employees = await Employee.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    employees,
    total,
  };
};

module.exports = getPendingEmployeesService;

