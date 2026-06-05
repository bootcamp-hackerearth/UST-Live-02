const login_User = require("../services/auth/login.service");
const getCurrent_LoggedInUser = require("../services/auth/get-current-user.service");
const create_EmployeePassword = require("../services/auth/create-password.service");

//login
const login = async (req, res) => {
  try {
    const loginResponse = await login_User(req.body);

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
    const serviceResponse = await create_EmployeePassword(req.body);

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

//Current User -->Logged in
const get_CurrentUser = async (req, res) => {
  try {
    const user = await getCurrent_LoggedInUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  createPassword,
  get_CurrentUser,
};
