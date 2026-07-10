const Employee = require("../../models/Employee");

const {
  applyCursorFilter,
  buildPagedResult,
  getPagination,
} = require("../../utils/pagination");

const applySearchFilter = (filter, search) => {
  if (!search?.trim()) {
    return;
  }

  filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
    { employeeCode: { $regex: search, $options: "i" } },
  ];
};

const applyExactTextFilter = (filter, filterKey, value) => {
  if (!value?.trim()) {
    return;
  }

  filter[filterKey] = {
    $regex: `^${value.trim()}$`,
    $options: "i",
  };
};

const applyFilters = (filter, query) => {
  if (query.status) {
    filter.status = query.status;
  }

  applyExactTextFilter(filter, "department", query.department);
  applyExactTextFilter(filter, "designation", query.designation);
};

const getEmployeesService = async (query) => {
  const filter = {
    isDeleted: false,
  };

  applySearchFilter(filter, query.search);
  applyFilters(filter, query);

  // pagination
  const pagination = getPagination(query.page, query.limit);
  const isCursorPagination =
    query.pagination === "cursor" || Boolean(query.cursor);
  const totalFilter = { ...filter };

  applyCursorFilter(filter, isCursorPagination ? query.cursor : null);

  const total = await Employee.countDocuments(totalFilter);

  const employees = await Employee.find(filter)
    .select(
      "employeeCode name email phone department designation status createdAt",
    )
    .sort({
      createdAt: -1,
      _id: -1,
    })
    .skip(isCursorPagination ? 0 : pagination.skip)
    .limit(isCursorPagination ? pagination.limit + 1 : pagination.limit)
    .lean();

  return buildPagedResult({
    items: employees,
    pagination,
    isCursorPagination,
    total,
  });
};

module.exports = getEmployeesService;
