const Node = require("../models/Node");
const ApiError = require("../utils/ApiError");

const normalizePath = (path) => {
  const normalized = `/${path || ""}`
    .replace(/\/+/g, "/")
    .replace(/\/$/, "");

  return normalized || "/";
};

const getMatchedRoutePath = (req) => {
  
  const routePath = Array.isArray(req.route?.path)
    ? req.route.path[0]
    : req.route?.path;

  return normalizePath(`${req.baseUrl || ""}${routePath || ""}`);
};

const nodePermissionMiddleware = async (req, res, next) => {
  try {
    const userRoles = req.user?.roles || [];

    if (!userRoles.length) {
      throw new ApiError(403, "Access denied", "FORBIDDEN", {
        reason: "No roles found in token",
      });
    }

    const method = req.method.toUpperCase();
    const path = getMatchedRoutePath(req);

    const candidateNodes = await Node.find({
      isDeleted: false,
      isActive: true,
      roles: {
        $in: userRoles,
      },
      apiPermissions: {
        $elemMatch: {
          method: {
            $in: [method, "ALL"],
          },
          path,
        },
      },
    }).lean();

    const authorizedNode = candidateNodes.find((node) =>
      node.apiPermissions?.some((permission) => {
        const permissionMethod = permission.method?.toUpperCase();
        const methodMatches =
          permissionMethod === method || permissionMethod === "ALL";
        const pathMatches = permission.path === path;
        const permissionRoles = permission.roles || [];
        const roleMatches =
          !permissionRoles.length ||
          permissionRoles.some((role) => userRoles.includes(role));

        return methodMatches && pathMatches && roleMatches;
      }),
    );

    if (!authorizedNode) {
      throw new ApiError(403, "Access denied", "FORBIDDEN", {
        method,
        path,
        roles: userRoles,
      });
    }

    req.authorizedNode = authorizedNode;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = nodePermissionMiddleware;
