const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseDate = (value, endOfDay = false) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }

  return date;
};

const getPagination = (
  query,
  { allowedSortFields = ["createdAt"], defaultSort = { createdAt: -1 } } = {},
) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);

  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 100);

  const skip = (page - 1) * limit;

  const requestedSortBy =
    typeof query.sortBy === "string" ? query.sortBy.trim() : "";

  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
// check user is allowed to sort that field
  const sort = allowedSortFields.includes(requestedSortBy)
    ? { [requestedSortBy]: sortOrder }
    : defaultSort;

  const search = typeof query.search === "string" ? query.search.trim() : "";

  const status = typeof query.status === "string" ? query.status.trim() : "";

  const fromDate = parseDate(query.fromDate);

  const toDate = parseDate(query.toDate, true);

  return {
    page,
    limit,
    skip,
    sort,
    search,
    status,
    fromDate,
    toDate,
  };
};
// for db
const buildSearchFilter = (fields, search) => {
  if (!search) {
    return {};
  }

  const regex = new RegExp(escapeRegex(search), "i");

  return {
    $or: fields.map((field) => ({
      [field]: regex,
    })),
  };
};

const buildDateRangeFilter = (field, fromDate, toDate) => {
  if (!fromDate && !toDate) {
    return {};
  }

  const dateFilter = {};

  if (fromDate) {
    dateFilter.$gte = fromDate;
  }

  if (toDate) {
    dateFilter.$lte = toDate;
  }

  return {
    [field]: dateFilter,
  };
};

const 
getPaginationMeta = ({ page, limit, total }) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    totalRecords: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

module.exports = {
  getPagination,
  getPaginationMeta,
  buildSearchFilter,
  buildDateRangeFilter,
};
