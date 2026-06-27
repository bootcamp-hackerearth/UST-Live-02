const getPagination = (page = 1, limit = 10) => {
  const currentPage = Math.max(parseInt(page, 10) || 1, 1);

  const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    limit: pageSize,
    skip,
  };
};

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
  getPagination,
  buildPaginationMeta,
};
