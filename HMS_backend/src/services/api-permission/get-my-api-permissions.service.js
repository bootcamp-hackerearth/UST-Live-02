const ApiPermission = require("../../models/ApiPermission");

const getMyApiPermissions = async (roles = []) => {
  return ApiPermission.find({
    isActive: true,
    allowedRoles: { $in: roles },
  })
    .select("key")
    .sort({ key: 1 })
    .lean();
};

module.exports = getMyApiPermissions;
