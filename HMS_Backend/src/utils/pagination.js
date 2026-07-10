const mongoose = require("mongoose");

const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1);

  const pageSize = Math.max(Number.parseInt(limit, 10) || 10, 1);

  const skip = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    limit: pageSize,
    skip,
  };
};

const encodeCursor = (item) => {
  if (!item?.createdAt || !item?._id) {
    return null;
  }

  return Buffer.from(
    JSON.stringify({
      createdAt: item.createdAt,
      id: item._id,
    }),
  ).toString("base64url");
};

const decodeCursor = (cursor) => {
  if (!cursor) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    if (!parsed.createdAt || !parsed.id) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const buildCursorPaginationMeta = (limit, items, hasNextPage, total = 0) => ({
  limit,
  total,
  totalRecords: total,
  nextCursor: hasNextPage ? encodeCursor(items[items.length - 1]) : null,
  hasNextPage,
});

const buildPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    totalRecords: total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
};

const buildCreatedAtCursorFilter = (decodedCursor) => [
  {
    createdAt: {
      $lt: new Date(decodedCursor.createdAt),
    },
  },
  {
    createdAt: new Date(decodedCursor.createdAt),
    _id: {
      $lt: new mongoose.Types.ObjectId(decodedCursor.id),
    },
  },
];

const applyCursorFilter = (filter, cursor) => {
  const decodedCursor = decodeCursor(cursor);

  if (!decodedCursor) {
    return;
  }

  const existingSearch = filter.$or;
  delete filter.$or;

  filter.$and = [
    ...(existingSearch ? [{ $or: existingSearch }] : []),
    {
      $or: buildCreatedAtCursorFilter(decodedCursor),
    },
  ];
};

const buildPagedResult = ({
  items,
  pagination,
  isCursorPagination,
  total,
}) => {
  const hasNextCursorPage =
    isCursorPagination && items.length > pagination.limit;
  const data = hasNextCursorPage ? items.slice(0, pagination.limit) : items;

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

const isCursorPaginationRequest = (query) =>
  query.pagination === "cursor" || Boolean(query.cursor);

const preparePagedFilter = (filter, query) => {
  const pagination = getPagination(query.page, query.limit);
  const isCursorPagination = isCursorPaginationRequest(query);
  const totalFilter = { ...filter };

  applyCursorFilter(filter, isCursorPagination ? query.cursor : null);

  return {
    pagination,
    isCursorPagination,
    totalFilter,
  };
};

const applyMappedFilters = (filter, query, filterMap) => {
  Object.entries(filterMap).forEach(([queryKey, filterKey]) => {
    if (query[queryKey]) {
      filter[filterKey] = query[queryKey];
    }
  });
};

const executePagedQuery = async ({
  model,
  filter,
  totalFilter,
  pagination,
  isCursorPagination,
  buildQuery,
}) => {
  const total = await model.countDocuments(totalFilter);
  const items = await buildQuery(model.find(filter))
    .skip(isCursorPagination ? 0 : pagination.skip)
    .limit(isCursorPagination ? pagination.limit + 1 : pagination.limit)
    .lean();

  return buildPagedResult({
    items,
    pagination,
    isCursorPagination,
    total,
  });
};

module.exports = {
  applyCursorFilter,
  applyMappedFilters,
  buildPagedResult,
  buildCursorPaginationMeta,
  executePagedQuery,
  getPagination,
  buildPaginationMeta,
  decodeCursor,
  preparePagedFilter,
};
