const REFRESH_COOKIE_NAME = "hms_refresh_token";

const getRefreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const setRefreshCookie = (res, refreshToken) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    ...getRefreshCookieOptions(),
    maxAge: undefined,
  });
};

const getRefreshTokenFromRequest = (req) => {
  if (req.cookies?.[REFRESH_COOKIE_NAME]) {
    return req.cookies[REFRESH_COOKIE_NAME];
  }

  const cookieHeader = req.headers.cookie || "";
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key) {
      acc[key] = decodeURIComponent(valueParts.join("="));
    }

    return acc;
  }, {});

  return cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;
};

module.exports = {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  getRefreshTokenFromRequest,
  setRefreshCookie,
};
