const permissions = require('../utils/permission');
const ApiError = require('../utils/ApiError');
const authorize = (permission) => {
    return (req, res, next) => {
        const { role } = req.user;
        const allowedRoles = permissions[permission];
        if (!allowedRoles.includes(role)) {
            throw new ApiError(403, 'Access denied');
        }
        next();
    }
}
module.exports = authorize;
