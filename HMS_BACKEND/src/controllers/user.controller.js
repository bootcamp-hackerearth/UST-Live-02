const asyncHandler = require("express-async-handler");
const userService = require("../services/user.service");
const ApiResponse = require("../utils/ApiResponse");

const signUp = asyncHandler(async (req, res) => {
  console.log("in sign up");
  const user = await userService.createUser(req.body);
  res.status(201).send(new ApiResponse(201, user));
});

module.exports = {
  signUp,
};
