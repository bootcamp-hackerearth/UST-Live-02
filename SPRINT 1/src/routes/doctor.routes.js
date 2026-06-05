const express = require("express");
const { createDoctorUser } = require("../controllers/doctor.controller.js");
const router = express.Router();
const authorize = require("../middlewares/authorize.middleware");
router.post("/", authorize("CREATE_USER"), createDoctorUser);
module.exports = router;
