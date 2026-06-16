const jwt = require("jsonwebtoken");
const User = require("../models/Users");
const AppError = require("../utils/AppError");
const STATUS = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.NO_TOKEN);
    }

    const token = authHeader.split(" ")[1];

    // jwt.verify throwing is expected control flow for bad/expired tokens
    try {
        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
    }
    catch {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_TOKEN);
    }

    // Reject tokens whose account has since been soft-deleted or deactivated
    // (the soft-delete query hook makes a deleted user's lookup return null)
    const user = await User.findOne({ employeeCode: req.user.employeeCode }).select("status");

    if (!user || String(user.status) !== "ACTIVE") {
        throw new AppError(STATUS.UNAUTHORIZED, MESSAGES.AUTH.INVALID_TOKEN);
    }

    next();
};

module.exports = authenticateUser;
