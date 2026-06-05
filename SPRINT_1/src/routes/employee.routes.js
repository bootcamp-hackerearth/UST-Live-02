const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const validateMiddleware = require("../middleware/validate.middleware");
const {registerEmployeeValidation,} = require("../validations/employee.validation");
const {createEmployee,getEmployeeById,} = require("../controllers/employee.controller");

router.post("/",authMiddleware,roleMiddleware("ADMIN"),registerEmployeeValidation,validateMiddleware,createEmployee);

module.exports = router;