const jwt = require("jsonwebtoken");

const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN
    }
  );
};

module.exports = generateAccessToken;