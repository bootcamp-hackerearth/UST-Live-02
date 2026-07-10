const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");

const createNodeService = require("../services/node/create-node.service");
const getNodesService = require("../services/node/get-nodes.service");
const updateNodeService = require("../services/node/update-node.service");
const deleteNodeService = require("../services/node/delete-node.service");

const createNode = asyncHandler(async (req, res) => {
  const node = await createNodeService(req.body, req.user.userId);

  return res
    .status(201)
    .json(new ApiResponse(201, "Node created successfully", node));
});

const getNodes = asyncHandler(async (req, res) => {
  const nodes = await getNodesService(req.user, req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, "Nodes retrieved successfully", nodes));
});

const updateNode = asyncHandler(async (req, res) => {
  const node = await updateNodeService(
    req.params.id,
    req.body,
    req.user.userId,
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Node updated successfully", node));
});

const deleteNode = asyncHandler(async (req, res) => {
  const result = await deleteNodeService(req.params.id, req.user.userId);

  return res.status(200).json(new ApiResponse(200, result.message, result));
});

module.exports = {
  createNode,
  getNodes,
  updateNode,
  deleteNode,
};
