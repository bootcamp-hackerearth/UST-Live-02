const Node = require("../../models/Node");
const ROLES = require("../../constants/roles");

const getNodesService = async (user, query = {}) => {
  const isManagementRead =
    query.management === "true" && user.roles?.includes(ROLES.SUPER_ADMIN);

  const filter = isManagementRead
    ? {
        isDeleted: false,
      }
    : {
        isDeleted: false,
        isActive: true,
        roles: {
          $in: user.roles,
        },
      };

  const nodes = await Node.find(filter)
    .sort({
      order: 1,
    })
    .lean();

  const parents = nodes.filter((node) => !node.parent);

  return parents.map((parent) => ({
    ...parent,
    children: nodes.filter(
      (node) => node.parent?.toString() === parent._id.toString(),
    ),
  }));
};

module.exports = getNodesService;
