const bcrypt = require("bcryptjs");

const User = require("../../models/User");
const Employee = require("../../models/Employee");
const ApiError = require("../../utils/ApiError");

const createEmployeePassword = async (passwordData) => {
  const {
    temporaryPassword,
    newPassword,
    securityQuestion,
    securityAnswer,
  } = passwordData;
  const loginId = passwordData.loginId?.trim();

  let user = null;

  const isEmailLogin = loginId.includes("@");

  if (isEmailLogin) {
    user = await User.findOne({
      email: loginId.toLowerCase(),
      isDeleted: { $ne: true },
    });
  } else {
    const employee = await Employee.findOne({
      employeeCode: loginId,
      isDeleted: { $ne: true },
    });

    if (!employee) {
      throw new ApiError(404, "Invalid login ID", "NOT_FOUND");
    }

    user = await User.findOne({
      employeeId: employee._id,
      isDeleted: { $ne: true },
    });
  }

  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  if (!user.isFirstLogin) {
    throw new ApiError(
      409,
      "Password is already created for this account",
      "CONFLICT",
    );
  }

  const isTemporaryPasswordValid = await bcrypt.compare(
    temporaryPassword,
    user.temporaryPasswordHash,
  );

  if (!isTemporaryPasswordValid) {
    throw new ApiError(401, "Invalid temporary password", "UNAUTHORIZED");
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  const hashedSecurityAnswer = await bcrypt.hash(
    securityAnswer.trim().toLowerCase(),
    10,
  );

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



