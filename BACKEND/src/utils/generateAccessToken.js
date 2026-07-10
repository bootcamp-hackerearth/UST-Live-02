const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    jwtid: crypto.randomUUID(),
  });
};

module.exports = generateAccessToken;
