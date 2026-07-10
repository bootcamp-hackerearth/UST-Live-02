const Node = require("../../models/Node");
const ApiError = require("../../utils/ApiError");
const {
  ensureUniqueNodePath,
  ensureValidParentNode,
} = require("./node-rules.service");

const updateNodeService = async (id, updateData, userId) => {
  const node = await Node.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!node) {
    throw new ApiError(404, "Node not found", "NODE_NOT_FOUND");
  }

  await ensureUniqueNodePath(updateData.path, id);
  await ensureValidParentNode(updateData.parent, id);

  return Node.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      ...updateData,
      updatedBy: userId,
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );
};

module.exports = updateNodeService;
