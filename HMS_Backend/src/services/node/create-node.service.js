const Node = require("../../models/Node");
const ApiError = require("../../utils/ApiError");

const createNodeService = async (nodeData, userId) => {
  const existingNode = await Node.findOne({
    path: nodeData.path,
    isDeleted: false,
  });

  if (existingNode) {
    throw new ApiError(409, "Node already exists", "NODE_ALREADY_EXISTS");
  }

  return Node.create({
    ...nodeData,
    createdBy: userId,
  });
};

module.exports = createNodeService;
