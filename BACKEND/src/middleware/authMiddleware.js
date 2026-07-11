const { verifyAccessToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  try {
     const authHeader = req.headers?.authorization;
     const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]   
      : req.cookies?.accessToken; 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token expired",
      });
    }
    return res.status(401).json({
      success: false,
      code: "INVALID_TOKEN",
      message: error.message || "Invalid token",
    });
  }
};

module.exports = authMiddleware;
