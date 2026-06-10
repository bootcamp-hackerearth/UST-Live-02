const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({success: false, message: "Access denied"});
    }

    next();
  };
};

module.exports = roleMiddleware;
