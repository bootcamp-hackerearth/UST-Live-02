const User = require("../models/Users");
const Employee = require("../models/Employees");
const buildEmployeeProfile = require("./buildEmployeeProfile");
/**
 * Fetches the details of the currently logged-in employee
 * @param {string} employeeCode - The employee code
 * @param {Object} res - The response object
 * @returns {Promise<void>} A promise that resolves when the employee details are fetched
 */ 
async function getCurrentUser(employeeCode, res) {
    const user = await User.findOne({ employeeCode }).select("-passwordHash -__v");

    if (!user) {
        return res.status(404).json({ 
            message: "User not found" 
        });
    }

    const employee = await Employee.findOne({ employeeCode: user.employeeCode }).select("-__v");

    if (!employee) {
        return res.status(404).json({ 
            message: "Employee profile not found" 
        });
    }

    const profile = buildEmployeeProfile(employee);

    return res.status(200).json({
        message: "User retrieved successfully",
        user: {
            username: user.username,
            email: user.email,
            roles: user.roles,
            lastLoginAt: user.lastLoginAt,
            profile
        }
    });
};

module.exports = getCurrentUser;