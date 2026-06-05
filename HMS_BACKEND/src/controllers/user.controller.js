const asyncHandler = require('express-async-handler');
const userService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');

const signup = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(new ApiResponse(201, user));
});

module.exports = {
    signup
};