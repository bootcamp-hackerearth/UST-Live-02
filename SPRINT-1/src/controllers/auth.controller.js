const loginUser = require("../services/auth/login.service");
const getCurrentLoggedInUser = require("../services/auth/get-current-user.service");
const createEmployeePassword = require("../services/auth/create-password.service");

//login
const login = async (req, res) => {
  try {
    const loginResponse = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: loginResponse,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//create password
const createPassword = async (req, res) => {
  try {
    const serviceResponse = await createEmployeePassword(req.body);

    return res.status(200).json({
      success: true,
      message: serviceResponse.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//get current logged in user

const getCurrentUser = async (req, res) => {
  try {
    const user = await getCurrentLoggedInUser(req.user.userId);

    return res.status(200).json({success: true, data: user});
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = { login, createPassword, getCurrentUser};
