const Employee = require("../../models/Employee");

const {
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const getEmployeesService = async (query) => {
  const { search, status, department, designation, page, limit } = query;

  const filter = {
    isDeleted: false,
  };

  // search

  if (search?.trim()) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        employeeCode: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  // filters

  if (status) {
    filter.status = status;
  }

  if (department?.trim()) {
    filter.department = {
      $regex: `^${department.trim()}$`,
      $options: "i",
    };
  }

  if (designation?.trim()) {
    filter.designation = {
      $regex: `^${designation.trim()}$`,
      $options: "i",
    };
  }

  // pagination

  const pagination = getPagination(page, limit);

  const total = await Employee.countDocuments(filter);

  const employees = await Employee.find(filter)
    .select(
      "employeeCode name email phone department designation status createdAt",
    )
    .sort({
      createdAt: -1,
    })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .lean();

  return {
    data: employees,
    meta: buildPaginationMeta(pagination.page, pagination.limit, total),
  };
};

module.exports = getEmployeesService;
