const userModel = require("../models/User");
const employeeModel = require("../models/Employee");

//PROFILE
exports.profile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-passwordHash -__v");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const employee = await employeeModel.findOne({ employeeId: user.employeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        res.status(200).json({
            success: true,
            employee
        });
    } catch (err) {
        console.error("Profile error:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
}