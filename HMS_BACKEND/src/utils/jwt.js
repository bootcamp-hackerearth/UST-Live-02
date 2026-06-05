const jwt = require('jsonwebtoken');
const ApiError = require('./ApiError');
const tokenType = {
    ACCESS: "ACCESS",
    VERIFY_EMAIL: "VERIFY_EMAIL",
}
const tokenConfig = {
    ACCESS: {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "30m",
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

const verifyToken = ({ token, type }) => {
    console.log("Token type : ", type);
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
    verifyToken,
    tokenType
};