const ApiResponse = require('../utils/ApiResponse')
const authService = require('../service/auth.service')

const login = async (req, res) => {
    try {
        const result = await authService.loginEmployee(req.body);
        return res
            .status(200)
            .json(new ApiResponse(200, "Login Successfull", result));


    }
    catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message || "Login Failed"
            });

    };
}


const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const result = await authService.verifyEmployeeEmail(token);
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    "Email Verified Successfully",
                    result
                )
            );
    }
    catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message || "Email Verification Failed"
            });
    };
};


module.exports = { login, verifyEmail };