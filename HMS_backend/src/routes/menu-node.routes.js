const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const {
  createMenuNode,
  getMenuNodes,
  getMyMenu,
  updateMenuNode,
  deleteMenuNode,
} = require("../controllers/menu-node.controller");

const router = express.Router();

router.get("/my-menu", authMiddleware, getMyMenu);

router.post("/", authMiddleware, permissionMiddleware("menu-node:create"), createMenuNode);

router.get("/", authMiddleware, permissionMiddleware("menu-node:list"), getMenuNodes);

router.put("/:id", authMiddleware, permissionMiddleware("menu-node:update"), updateMenuNode);

router.delete("/:id", authMiddleware, permissionMiddleware("menu-node:delete"), deleteMenuNode);

module.exports = router;
