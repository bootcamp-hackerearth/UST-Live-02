const express = require("express");
const router = express.Router(); 


const { signupValidation,loginValidation } =require('../validation/authValidation');
const validate = require('../middlewares/validate')

const{signup,login,profile,verifyEmail} = require("../controllers/authController")
const auth = require("../middlewares/authMiddleware")

router.post("/signup",signupValidation,validate,signup);
router.post("/login",loginValidation,validate,login);
router.get("/me",auth,profile);
router.get("/verify-email",verifyEmail);


module.exports = router;