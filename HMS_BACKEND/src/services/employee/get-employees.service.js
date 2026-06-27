const Employee = require("../../models/Employee");
const { buildSearchFilter } = require("../../utils/pagination");

const getEmployeesService = async ({ skip, limit, sort, search, status }) => {
  const filter = {
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

  if (status) {
    filter.status = status;
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

module.exports = getEmployeesService;

