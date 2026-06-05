const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError');
const tokenType = {
    ACCESS: "ACCESS",
    VERIFY_EMAIL: "VERIFY_EMAIL",
}
const tokenConfig = {
    ACCESS: {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "15m",
    },

    VERIFY_EMAIL: {
        secret: process.env.JWT_VERIFY_SECRET,
        expiresIn: "1h",
    },

};
const generateToken = ({ payload, type }) => {
    const config = tokenConfig[type];
    if (!config) {
        throw new ApiError(500, "Invalid token type");
    }
    return jwt.sign(
        {
            ...payload,
            type,
        },
        config.secret,
        {
            expiresIn: config.expiresIn
        }
    );
};
const getJwtExpiry = (type) => {
    const config = tokenConfig[type];
    return config.expiresIn;
}
const verifyToken = ({ token, type }) => {
    const config = tokenConfig[type];
    if (!config) {
        throw new ApiError(500, 'Invalid token type');
    }
    const payload = jwt.verify(token, config.secret);
    if (payload.type !== type) {
        throw new ApiError(500, 'Invalid token type');
    }
    return payload;
};
module.exports = {
    generateToken,
    tokenType,
    verifyToken,
    getJwtExpiry
};
