const Employee = require("../../models/Employee");

const {
  applyCursorFilter,
  buildPagedResult,
  getPagination,
} = require("../../utils/pagination");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const applySearchFilter = (filter, search) => {
  const value = search?.trim();

  if (!value) {
    return;
  }

  const regex = escapeRegex(value);

  filter.$or = [
    { name: { $regex: regex, $options: "i" } },
    { email: { $regex: regex, $options: "i" } },
    { employeeCode: { $regex: regex, $options: "i" } },
    { phone: { $regex: regex, $options: "i" } },
    { department: { $regex: regex, $options: "i" } },
    { designation: { $regex: regex, $options: "i" } },
  ];
};

const applyTextFilter = (filter, filterKey, value) => {
  const filterValue = value?.trim();

  if (!filterValue) {
    return;
  }

  filter[filterKey] = {
    $regex: escapeRegex(filterValue),
    $options: "i",
  };
};

const applyFilters = (filter, query) => {
  if (query.status?.trim()) {
    filter.status = query.status.trim();
  }

  applyTextFilter(filter, "department", query.department);
  applyTextFilter(filter, "designation", query.designation);
};

const getEmployeesService = async (query) => {
  const filter = {
    isDeleted: { $ne: true },
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
