const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const roleMiddleware = require("../middleware/role.middleware");

const ROLES = require("../constants/roles");
const validateMiddleware = require("../middleware/validate.middleware");
const {
  nodeIdValidation,
  nodeManagementQueryValidation,
  nodePayloadValidation,
} = require("../validations/node.validation");

const {
  createNode,
  getNodes,
  updateNode,
  deleteNode,
} = require("../controllers/node.controller");

router.get(
  "/",
  authMiddleware,
  nodeManagementQueryValidation,
  validateMiddleware,
  getNodes,
);

router.post(
  "/",
  authMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN),
  nodePayloadValidation,
  validateMiddleware,
  createNode,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN),
  nodeIdValidation,
  nodePayloadValidation,
  validateMiddleware,
  updateNode,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN),
  nodeIdValidation,
  validateMiddleware,
  deleteNode,
);

module.exports = router;
