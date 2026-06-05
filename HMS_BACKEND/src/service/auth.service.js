const User = require('../models/User.model')
const RoleModel = require('../models/Role.model');
const Employee = require('../models/Employee.model')
const bcrypt = require('bcrypt');
const { generateToken, verifyToken, tokenType } = require('../utils/jwt')
const ApiError = require('../utils/ApiError');


exports.loginEmployee = async ({ email, password }) => {
    const user = await User.findOne({ email }).populate("roleId");

    if (!user) {
        throw new ApiError(404, "Employee Not Found");
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordMatch) {
        throw new ApiError(401, "Invalid Credentials");
    }

    if (!user.isVerified) {
        throw new ApiError(401, "Please verify your mail before login");
    }

    const token = generateToken(
        {
            payload: {
                userId: user._id,
                role: user.roleId.name,
                roleCode: user.roleId.roleCode
            },
            type: tokenType.ACCESS,
        }
    );

    //this login token contains the user id and role id as the payload for the jwt token
    user.lastLoginAt = new Date();

    await user.save();


    return {
        token: token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roleId: user.roleId,
            status: user.status

        }
    };
};

//verification of the user
exports.verifyEmployeeEmail = async (token) => {

    const decoded = verifyToken({ token, type: tokenType.VERIFY_EMAIL });
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new ApiError(404, "User Not Found");
    }

    user.isVerified = true;
    await user.save();

    return {
        email: user.email,
        isVerified: user.isVerified,
        message: "Employee Email Verified successfully"
    };
};

