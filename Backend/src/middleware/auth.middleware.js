const jwt = require("jsonwebtoken");

const ERR = require("../utils/errors");

const authMiddleware = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return next(ERR.tokenRequired());
    }

    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : null;

    if (!token) {
      return next(ERR.invalidAuthorizationFormat());
    }

    req.user = jwt.verify(token, process.env.JWT_SECRET);

    return next();
  } catch {
    return next(ERR.invalidToken());
  }
};

module.exports = authMiddleware;
