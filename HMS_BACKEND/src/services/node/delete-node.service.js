const Node = require("../../models/Node");
const ApiError = require("../../utils/ApiError");

const getDescendantIds = async (nodeId) => {
  const children = await Node.find({
    parent: nodeId,
    isDeleted: false,
  })
    .select("_id")
    .lean();

  const nestedIds = await Promise.all(
    children.map((child) => getDescendantIds(child._id)),
  );

  return [
    ...children.map((child) => child._id),
    ...nestedIds.flat(),
  ];
};

const deleteNodeService = async (id, userId) => {
  const node = await Node.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!node) {
    throw new ApiError(404, "Node not found", "NODE_NOT_FOUND");
  }

  const descendantIds = await getDescendantIds(id);
  const deletedAt = new Date();

  await Node.updateMany(
    {
      _id: {
        $in: [id, ...descendantIds],
      },
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedBy: userId,
      deletedAt,
    },
  );

  return {
    message:
      descendantIds.length > 0
        ? "Node and child nodes deleted successfully"
        : "Node deleted successfully",
    deletedCount: descendantIds.length + 1,
  };
};

module.exports = deleteNodeService;
