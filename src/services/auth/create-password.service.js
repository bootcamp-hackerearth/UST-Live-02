const bcrypt = require("bcryptjs");
const findUserByLoginId = require("../../utils/findUserByLoginId");

const createEmployeePassword = async (passwordData) => {
  const {
    loginId,
    temporaryPassword,
    newPassword,
    securityQuestion,
    securityAnswer,
  } = passwordData;

  const user = await findUserByLoginId(loginId, "User not found");

  if (!user.isFirstLogin) {
    throw new Error("Password is already created for this account");
  }

  const isTemporaryPasswordValid = await bcrypt.compare(
    temporaryPassword,
    user.temporaryPasswordHash,
  );

  if (!isTemporaryPasswordValid) {
    throw new Error("Invalid temporary password");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  user.passwordHash = hashedNewPassword;
  user.temporaryPasswordHash = null;
  user.isFirstLogin = false;
  user.securityQuestion = securityQuestion;
  user.securityAnswer = securityAnswer;

  await user.save();

  return { message: "Password created successfully" };
};

module.exports = createEmployeePassword;
