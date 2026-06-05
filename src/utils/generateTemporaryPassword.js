const crypto = require("node:crypto");

const generateTemporaryPassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#";

  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(crypto.randomInt(0, chars.length));
  }

  return password;
};

module.exports = generateTemporaryPassword;
