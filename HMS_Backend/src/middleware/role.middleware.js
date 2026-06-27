const ApiError = require("../utils/ApiError");

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user?.roles || [];

    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return next(new ApiError(403, "Access denied", "FORBIDDEN"));
    }

    next();
  };
};

module.exports = roleMiddleware;
