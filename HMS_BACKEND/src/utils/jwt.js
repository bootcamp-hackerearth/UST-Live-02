const jwt = require("jsonwebtoken");

const generateToken = (
  payload,
  expiresIn = process.env.JWT_EXPIRES_IN || "1d"
) => {
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn }
  );
};

const verifyToken = (token) => {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET
  );
};

module.exports = {
  generateToken,
  verifyToken,
};