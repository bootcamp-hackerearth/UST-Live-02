const express = require("express");

const { getMyApiPermissions } = require("../controllers/api-permission.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/my-permissions", authMiddleware, getMyApiPermissions);

module.exports = router;
