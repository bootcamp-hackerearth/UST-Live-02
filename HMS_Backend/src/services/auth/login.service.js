const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");
const findUserByLoginId = require("../../utils/findUserByLoginId");

const loginUser = async (loginData) => {
  const { loginId, password } = loginData;

  const user = await findUserByLoginId(loginId, "Invalid credentials");

  let isPasswordValid = false;

  if (user.isFirstLogin) {
    isPasswordValid = await bcrypt.compare(
      password,
      user.temporaryPasswordHash,
    );
  } else {
    isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  }

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const tokenPayload = {
    userId: user._id,
    employeeId: user.employeeId,
    roles: user.roles,
  };

  const token = generateToken(tokenPayload);

  user.lastLoginAt = new Date();
  await user.save();

  return {
    token,
    user: {
      email: user.email,
      roles: user.roles,
      employeeId: user.employeeId,
    },
  };
};

module.exports = loginUser;
