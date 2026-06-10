const User = require("../../models/User");
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId).populate("employeeId");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
module.exports = getCurrentUser;
