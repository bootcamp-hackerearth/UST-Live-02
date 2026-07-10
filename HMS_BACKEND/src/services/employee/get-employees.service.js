const Employee = require("../../models/Employee");

const {
  applyCursorFilter,
  buildCursorPaginationMeta,
  getPagination,
  buildPaginationMeta,
} = require("../../utils/pagination");

const getEmployeesService = async (query) => {
  const {
    search,
    status,
    department,
    designation,
    page,
    limit,
    cursor,
    pagination: paginationMode,
  } = query;

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
      $regex: department.trim(),
      $options: "i",
    };
  }

  if (designation?.trim()) {
    filter.designation = {
      $regex: designation.trim(),
      $options: "i",
    };
  }

  // pagination
  const pagination = getPagination(page, limit);
  const isCursorPagination = paginationMode === "cursor" || Boolean(cursor);
  const totalFilter = { ...filter };

  if (isCursorPagination && cursor) {
    applyCursorFilter(filter, cursor);
  }

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

  const hasNextCursorPage =
    isCursorPagination && employees.length > pagination.limit;
  const data = hasNextCursorPage
    ? employees.slice(0, pagination.limit)
    : employees;

  return {
    data,
    meta: isCursorPagination
      ? buildCursorPaginationMeta(
          pagination.limit,
          data,
          hasNextCursorPage,
          total,
        )
      : buildPaginationMeta(pagination.page, pagination.limit, total),
  };
};

module.exports = getEmployeesService;
