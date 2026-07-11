const ApiResponse = require("../utils/ApiResponse");
const authService = require("../service/auth.service");

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const result = await authService.verifyEmployeeEmail(token);
    return res
      .status(200)
      .json(new ApiResponse(200, "Email Verified Successfully", result));
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "something went wrong",
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await authService.loginEmployee(req.body);
    const isMobile = req.headers['x-client-type'] === 'mobile';//specifically for mobile sending the token not to expose the tokens in the angular side 

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(
      new ApiResponse(200, "Login Successful", {
        ...(isMobile && {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
        user: result.user,
      }),
    );
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "something went wrong",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const isMobile = req.headers['x-client-type'] === 'mobile';
    const refreshTokenCookie = isMobile
      ? req.body.refreshToken
      : req.cookies?.refreshToken;

    if (!refreshTokenCookie) {
      return res.status(401).json({
        success: false,
        message: "Refresh token missing",
      });
    }

    const result = await authService.refreshAccessToken(refreshTokenCookie);

    if (!isMobile) {
      res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
      ...(isMobile && {
        data: { accessToken: result.accessToken }
      }),
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: "REFRESH_TOKEN_INVALID",
      message: error.message || "Unable to refresh token"
    });

  }
};

const logout = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await authService.changePassword(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const changeFirstLoginPassword = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.userId;

    const { newPassword } = req.body;

    const result =
      await authService.changeFirstLoginPassword(
        userId,
        newPassword
      );

    return res.status(200).json({
      success: true,

      message:
        "Password changed successfully. Please log in again using your new password.",

      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
 
    return res.status(200).json({
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
};
 
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
 
    const result = await authService.resetPassword(token, newPassword);
 
    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyEmail,
  login,
  refreshToken,
  logout,
  changePassword,
  changeFirstLoginPassword,
  forgotPassword,
  resetPassword
};
