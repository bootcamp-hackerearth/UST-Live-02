const { body, param, query } = require("express-validator");

const ROLES = require("../constants/roles");

const allowedRoles = Object.values(ROLES);
const allowedMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "ALL"];

const nodeIdValidation = [
  param("id").isMongoId().withMessage("Valid node ID is required"),
];

const nodeManagementQueryValidation = [
  query("management")
    .optional()
    .isBoolean()
    .withMessage("Management must be a boolean"),
];

const nodePayloadValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Node name is required")
    .isLength({
      min: 2,
      max: 80,
    })
    .withMessage("Node name must be 2 to 80 characters"),
  body("path")
    .trim()
    .notEmpty()
    .withMessage("Node path is required")
    .matches(/^\/[a-zA-Z0-9/_:-]*$/)
    .withMessage("Node path must start with / and contain a valid route path"),
  body("icon").optional({ checkFalsy: true }).trim().isLength({
    max: 50,
  }),
  body("order").optional().isInt().withMessage("Order must be a number"),
  body("roles")
    .isArray({
      min: 1,
    })
    .withMessage("At least one role is required"),
  body("roles.*").isIn(allowedRoles).withMessage("Invalid node role"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("Active flag must be boolean"),
  body("parent")
    .optional({
      nullable: true,
      checkFalsy: true,
    })
    .isMongoId()
    .withMessage("Parent must be a valid node ID"),
  body("apiPermissions")
    .optional()
    .isArray()
    .withMessage("API permissions must be an array"),
  body("apiPermissions.*.method")
    .if(body("apiPermissions").exists())
    .isIn(allowedMethods)
    .withMessage("Invalid API permission method"),
  body("apiPermissions.*.path")
    .if(body("apiPermissions").exists())
    .trim()
    .matches(/^\/api\/[a-zA-Z0-9/_:-]*$/)
    .withMessage("API permission path must start with /api/"),
  body("apiPermissions.*.roles")
    .optional()
    .isArray()
    .withMessage("API permission roles must be an array"),
  body("apiPermissions.*.roles.*")
    .optional()
    .isIn(allowedRoles)
    .withMessage("Invalid API permission role"),
];

module.exports = {
  nodeIdValidation,
  nodeManagementQueryValidation,
  nodePayloadValidation,
};
