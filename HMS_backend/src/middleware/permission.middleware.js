const ApiPermission = require("../models/ApiPermission");
const ERR = require("../utils/errors");

const permissionMiddleware = (permissionKey) => {
  return async (req, res, next) => {
    try {
      const userRoles = req.user?.roles || [];

      const permission = await ApiPermission.findOne({
        key: permissionKey,
        isActive: true,
      }).lean();

      if (!permission) {
        return next(ERR.accessDenied());
      }

      const hasPermission = permission.allowedRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasPermission) {
        return next(ERR.accessDenied());
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = permissionMiddleware;
