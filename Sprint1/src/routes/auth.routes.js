const express = require('express');
const router = express.Router();
const {login,verifyEmail,getMyInfo} = require('../controllers/auth.controller')
const jwtAuth =require('../middlewares/jwtAuth.middleware')

router.get('/verify', verifyEmail);
router.post('/login', login);
router.get('/me', jwtAuth, getMyInfo);
module.exports = router;

