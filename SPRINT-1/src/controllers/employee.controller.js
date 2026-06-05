const STATUS = require("../constants/status");
const registerEmployee = require("../services/employee/register-employee.service");
const generateTemporaryPassword = require("../utils/generateTemporaryPassword");

// create employee
const createEmployee = async (req, res) => {
  try {
    const serviceResponse = await registerEmployee(req.body);

    return res.status(201).json({ success: true, message: "Employee registered successfully", data: serviceResponse });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Phone number already exists"});
    }

    return res.status(400).json({ success: false, message: error.message});
  }
};



module.exports = {createEmployee};
