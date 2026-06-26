const User = require("../../models/User");
const ERR = require("../../utils/errors");

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate("employeeId");

  if (!user) {
throw ERR.userProfileNotFound();  }

  return user;
};

module.exports = getCurrentUser;