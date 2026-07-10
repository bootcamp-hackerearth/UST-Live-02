const {
  getPagination,
  buildPaginationMeta,
} = require("../../src/utils/pagination");

describe("pagination utilities", () => {
  test("normalizes invalid page and default limit values", () => {
    expect(getPagination("-2", "0")).toEqual({
      page: 1,
      limit: 10,
      skip: 0,
    });
  });

  test("calculates skip for valid page and limit", () => {
    expect(getPagination("3", "25")).toEqual({
      page: 3,
      limit: 25,
      skip: 50,
    });
  });

  test("builds pagination metadata", () => {
    expect(buildPaginationMeta(2, 10, 21)).toEqual({
      page: 2,
      limit: 10,
      total: 21,
      totalRecords: 21,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });
});
