const asyncHandler = require("../utils/asyncHandler");
const getMyApiPermissionsService = require("../services/api-permission/get-my-api-permissions.service");

const getMyApiPermissions = asyncHandler(async (req, res) => {
  const permissions = await getMyApiPermissionsService(req.user.roles);

  return res.status(200).json({
    success: true,
    message: "API permissions fetched successfully",
    data: permissions.map((permission) => permission.key),
  });
});

module.exports = {
  getMyApiPermissions,
};
