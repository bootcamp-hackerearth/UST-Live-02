const bcrypt = require('bcrypt');
const ApiError = require('../utils/ApiError');
const jwt = require('../utils/jwt');
const User = require('../models/user.model');
const Role = require('../models/role.model');
const Employee = require('../models/employee.model');

const verifyUserByEmail = async (token) => {
    if (!token) {
        throw new ApiError(400, "Token is required");
    }
    const decoded = jwt.verifyToken({ token, type: jwt.tokenType.VERIFY_EMAIL });
    const userId = decoded.userId;
    const user = await User.findById(userId);
    user.isVerified = true;
    const savedUser = await user.save();
    return {
        isVerified: savedUser.isVerified,
        email: user.email,
    }
}

const loginUser = async (password, email) => {
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
        throw new ApiError(401, 'invalid credentails');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid credentails');
    }
    if (!user.isVerified) {
        throw new ApiError(403, 'verify emai before logging in ');
    }
    const role = await Role.findById(user.roleId);
    const token = jwt.generateToken(
        {
            payload: {
                userId: user._id,
                role: role.roleCode,
            },
            type: jwt.tokenType.ACCESS,
        }
    );
    return token;
}

const getUserInfo = async (userId, role) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const profile = await Employee.findOne({ userId });

    if (!profile) {
        throw new ApiError(404, 'profile not found');
    }

    return {
        user,
        profile
    };
};

module.exports = {
    verifyUserByEmail,
    loginUser,
    getUserInfo
}