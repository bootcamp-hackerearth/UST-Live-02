const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const validateMiddleware = require("../middleware/validate.middleware");
const {loginValidation, createPasswordValidation} = require("../validations/auth.validation");
const {login,createPassword,getCurrentUser} = require("../controllers/auth.controller");
const { register } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", loginValidation, validateMiddleware, login);
router.post( "/create-password", createPasswordValidation, validateMiddleware,createPassword,);
router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;
