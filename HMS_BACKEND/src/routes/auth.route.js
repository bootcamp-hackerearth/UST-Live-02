const express = require("express");
const router = express.Router();
const {
  login,
  verifyEmail,
  getMyInfo,
} = require("../controllers/auth.controller");
const jwtAuth = require("../middlewares/jwtAuth.middleware");

router.post("/login", login);
router.get("/me", jwtAuth, getMyInfo);
router.get("/verify", verifyEmail);

module.exports = router;
