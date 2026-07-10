const mongoose = require("mongoose");

const applyCursorFilter = (filter, cursor) => {
  const decodedCursor = decodeCursor(cursor);
  if (!decodedCursor) return;
  const existingSearch = filter.$or;
  delete filter.$or;
  filter.$and = [
    ...(existingSearch ? [{ $or: existingSearch }] : []),
    {
      $or: [
        { createdAt: { $lt: new Date(decodedCursor.createdAt) } },
        {
          createdAt: new Date(decodedCursor.createdAt),
          _id: { $lt: new mongoose.Types.ObjectId(decodedCursor.id) },
        },
      ],
    },
  ];
};

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
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPreviousPage: page > 1,
  };
};

module.exports = {
  applyCursorFilter,
  buildCursorPaginationMeta,
  getPagination,
  buildPaginationMeta,
  decodeCursor,
};
