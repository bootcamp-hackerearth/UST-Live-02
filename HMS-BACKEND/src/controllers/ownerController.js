const Employee = require("../models/Employees");
const User = require("../models/Users");
const emailTemplates = require("../utils/emailTemplates");
const buildEmployeeResponse = require("../utils/buildEmployeeResponse");
const createAccountWithEmployee = require("../utils/createAccountWithEmployee");
/**
*   Create an ADMIN account with a temporary password
* @param {Object} req - The request object containing employee and user data
* @param {Object} res - The response object
* @returns {Promise<void>} A promise that resolves when the account is created and email is sent
*/
const createAdmin = async (req, res) => {
  try {
    const { employee, user } = await createAccountWithEmployee(req, { // NOSONAR: false positive; function is async but Sonar loses type info across CommonJS require
      roles: ["ADMIN"],
      emailTemplate: emailTemplates.adminCredentials,
    });

    return res.status(201).json({
      message: "Admin account created successfully. Credentials sent via email.",
      employee: {
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        designation: employee.designation,
      },
      user: {
        username: user.username,
        roles: user.roles,
        status: user.status,
      },
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error("Error during admin creation: ", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
* List all admin users with their linked employee records
*@param {Object} req - The request object
* @param {Object} res - The response object
* @returns {Promise<void>} A promise that resolves when the admins are retrieved and sent in response
*/
const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      roles: "ADMIN",
    }).select("-passwordHash");

    const employeeCodes = admins.map((admin) => admin.employeeCode);

    const employees = await Employee.find({
      employeeCode: { $in: employeeCodes },
    });

    const formattedAdmins = buildEmployeeResponse(employees, admins);

    return res.status(200).json({
      totalAdmins: formattedAdmins.length,
      admins: formattedAdmins,
    });
  } catch (err) {
    console.error("Error during admin retrieval: ", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

module.exports = {
  createAdmin,
  getAdmins,
};