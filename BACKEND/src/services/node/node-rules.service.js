const Node = require("../../models/Node");
const ApiError = require("../../utils/ApiError");

const ensureUniqueNodePath = async (path, excludeNodeId = null) => {
  const filter = {
    path,
    isDeleted: false,
  };

  if (excludeNodeId) {
    filter._id = {
      $ne: excludeNodeId,
    };
  }

  const existingNode = await Node.findOne(filter);

  if (existingNode) {
    throw new ApiError(409, "Node already exists", "NODE_ALREADY_EXISTS");
  }
};

const ensureValidParentNode = async (parentId, currentNodeId = null) => {
  if (!parentId) {
    return;
  }

  if (currentNodeId && parentId.toString() === currentNodeId.toString()) {
    throw new ApiError(400, "Node cannot be its own parent", "INVALID_PARENT");
  }

  const parentNode = await Node.findOne({
    _id: parentId,
    isDeleted: false,
  });

  if (!parentNode) {
    throw new ApiError(404, "Parent node not found", "PARENT_NODE_NOT_FOUND");
  }

  if (parentNode.parent) {
    throw new ApiError(
      400,
      "Only root nodes can be selected as parent nodes",
      "PARENT_MUST_BE_ROOT_NODE",
    );
  }
};

module.exports = {
  ensureUniqueNodePath,
  ensureValidParentNode,
};
