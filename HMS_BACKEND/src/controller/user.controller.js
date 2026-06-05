const ApiResponse = require('../utils/ApiResponse')
const userService = require('../service/user.service')
const ApiError = require('../utils/ApiError')

const createEmployee = async (req, res, next) => {
    try {
        const employee = await userService.createEmployeeUser(req.body);

        return res
            .status(201)
            .json(new ApiResponse(201, "Employee Registered Successfully", employee));
    }


    catch (error) {
        const statusCode = error.statusCode || 500;

        return res
            .status(statusCode)
            .json({
                success: false,
                statusCode,
                message: error.message || "Employee Creation Failed"
            });
    }
};




const getCurrentProfile = async (req, res) => {
    try {

        const userId = req.user.userId;
        const profile = await userService.currentProfile(userId);

        return res.status(200)
            .json({
                success: true,
                statusCode: 200,
                message: "Profile Fetched Successfully",
                data: profile
            })
    }
    catch (error) {
        const statusCode = error.statusCode || 500;

        return res
            .status(statusCode)
            .json({
                success: false,
                statusCode,
                message: error.message || "Profile Fetching Failed"
            });
    }
}


module.exports = { createEmployee, getCurrentProfile };
