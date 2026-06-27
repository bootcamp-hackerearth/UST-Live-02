const User = require(
  "../models/User.model"
);

const requirePasswordChanged = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(
      userId
    ).select("mustChangePassword");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.mustChangePassword) {
      return res.status(403).json({
        success: false,
        code:
          "PASSWORD_CHANGE_REQUIRED",
        message:
          "You must change your temporary password before accessing this resource",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports =
  requirePasswordChanged;