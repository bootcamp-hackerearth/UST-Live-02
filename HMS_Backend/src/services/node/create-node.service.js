const Node = require("../../models/Node");
const {
  ensureUniqueNodePath,
  ensureValidParentNode,
} = require("./node-rules.service");

const createNodeService = async (nodeData, userId) => {
  await ensureUniqueNodePath(nodeData.path);
  await ensureValidParentNode(nodeData.parent);

  return Node.create({
    ...nodeData,
    createdBy: userId,
  });
};

module.exports = createNodeService;
