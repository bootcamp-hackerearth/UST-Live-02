const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const nodePermissionMiddleware = require("../middleware/node-permission.middleware");

const roleMiddleware = require("../middleware/role.middleware");

const ROLES = require("../constants/roles");

const {
  createNode,
  getNodes,
  updateNode,
  deleteNode,
} = require("../controllers/node.controller");

router.get("/", authMiddleware, getNodes);

router.post(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  createNode,
);

router.put(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  updateNode,
);

router.delete(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN),
  deleteNode,
);

module.exports = router;
