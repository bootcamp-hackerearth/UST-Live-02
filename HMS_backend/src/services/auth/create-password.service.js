const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const ERR = require("../../utils/errors");

const createEmployeePassword = async (passwordData) => {
  const {
    loginId,
    temporaryPassword,
    newPassword,
    securityQuestion,
    securityAnswer,
  } = passwordData;

  let user = null;

  //  login using email or employee code
  const isEmailLogin = loginId.includes("@");

  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
    });
  } else {
    const employee = await Employee.findOne({
      employeeCode: loginId,
    });

    if (!employee) {
throw ERR.invalidLoginId();    }

    user = await User.findOne({
      employeeId: employee._id,
    });
  }

  // Ensure user account exists
  if (!user) {
throw ERR.userNotFound();  }

  // Prevent password recreation after first login
  if (!user.isFirstLogin) {
throw ERR.passwordAlreadyCreated();  }

  // Verify temporary password
  const isTemporaryPasswordValid = await bcrypt.compare(
    temporaryPassword,
    user.temporaryPasswordHash,
  );

  if (!isTemporaryPasswordValid) {
throw ERR.invalidTemporaryPassword();  }

  // Hash password and security answer
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10,
  );

  // Update account credentials
  user.passwordHash = hashedNewPassword;
  user.temporaryPasswordHash = null;
  user.isFirstLogin = false;
  user.securityQuestion = securityQuestion;
  user.securityAnswer = hashedSecurityAnswer;

  await user.save();

  return {
    message: "Password created successfully",
  };
};

module.exports = createEmployeePassword;
