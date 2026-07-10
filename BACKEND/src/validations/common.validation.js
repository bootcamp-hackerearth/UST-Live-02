const { query } = require("express-validator");

const paginationQueryValidation = [
  query("page")
    .optional()
    .isInt({
      min: 1,
    })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({
      min: 1,
      max: 100,
    })
    .withMessage("Limit must be between 1 and 100"),
  query("cursor")
    .optional()
    .isLength({
      max: 500,
    })
    .withMessage("Cursor is invalid"),
  query("pagination")
    .optional()
    .isIn(["page", "cursor"])
    .withMessage("Pagination must be page or cursor"),
];

module.exports = {
  paginationQueryValidation,
};
