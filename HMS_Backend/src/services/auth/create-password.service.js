const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");

const createEmployeePassword = async (passwordData) => {
  const {
    loginId,
    temporaryPassword,
    newPassword,
    securityQuestion,
    securityAnswer,
  } = passwordData;

  let user = null;

  // Allow login using email or employee code
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
      throw new Error("Invalid login ID");
    }

    user = await User.findOne({
      employeeId: employee._id,
    });
  }

  // Ensure user account exists
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent password recreation after first login
  if (!user.isFirstLogin) {
    throw new Error("Password is already created for this account");
  }

  // Verify temporary password
  const isTemporaryPasswordValid = await bcrypt.compare(
    temporaryPassword,
    user.temporaryPasswordHash
  );

  if (!isTemporaryPasswordValid) {
    throw new Error("Invalid temporary password");
  }

  // Hash password and security answer
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10
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