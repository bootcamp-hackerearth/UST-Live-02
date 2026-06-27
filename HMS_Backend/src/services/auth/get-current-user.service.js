const User = require("../../models/User");
const ApiError = require("../../utils/ApiError");

const getCurrentUser = async (userId) => {
  const user = await User.findOne({
    _id: userId,
    isDeleted: false,
  }).populate({
    path: "employeeId",
    match: {
      isDeleted: false,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  return user;
};

module.exports = getCurrentUser;
