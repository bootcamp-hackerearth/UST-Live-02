const asyncHandler = require('express-async-handler');
const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');

const login = asyncHandler(async (req, res) => {
    const { password, email } = req.body;
    const responseData = await authService.loginUser(password, email);
    res.status(200).json(new ApiResponse(200, responseData));
});

const getMyInfo = asyncHandler(async (req, res) => {
    const { userId, role } = req.user;
    const data = await authService.getUserInfo(userId, role);
    res.status(200).json(new ApiResponse(200, data));
});
const verifyEmail = asyncHandler(async (req, res) => {
    const token = req.query.token;
    const response = await authService.verifyUserByEmail(token);
    res.status(200).json(new ApiResponse(200, response));
});
module.exports = {
    login,
    getMyInfo,
    verifyEmail
};