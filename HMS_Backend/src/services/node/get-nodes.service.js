const Node = require("../../models/Node");

const getNodesService = async (user) => {
  const nodes = await Node.find({
    isDeleted: false,
    isActive: true,
    roles: {
      $in: user.roles,
    },
  })
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
