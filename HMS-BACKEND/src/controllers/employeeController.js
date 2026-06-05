const getCurrentUser = require("../utils/getCurrentUser");
/**
 * Fetch the current user's account and profile
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>} A promise that resolves when the user's information is fetched
 */
exports.getMe = async (req, res) => {

    try {
        return await getCurrentUser(req.user.employeeCode, res);
    }
    catch (err) {
        console.error("Error during getMe: ", err);
        return res.status(500).json({
            message: "Server error while fetching current user"
        });
    }
};