const ApiError = require("../utils/ApiError");
const jwt = require("../utils/jwt");

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "token missing"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verifyToken({
      token,
      type: jwt.tokenType.ACCESS,
    });
    req.user = decoded;
    console.log("decoded", decoded);

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = jwtAuth;
