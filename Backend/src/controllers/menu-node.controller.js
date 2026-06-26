const mongoose = require("mongoose");

const asyncHandler = require("../utils/asyncHandler");
const ERR = require("../utils/errors");
const createMenuNodeService = require("../services/menu-node/create-menu-node.service");
const getMenuNodesService = require("../services/menu-node/get-menu-nodes.service");
const getMyMenuService = require("../services/menu-node/get-my-menu.service");
const updateMenuNodeService = require("../services/menu-node/update-menu-node.service");
const deleteMenuNodeService = require("../services/menu-node/delete-menu-node.service");

const createMenuNode = asyncHandler(async (req, res) => {
  const menuNode = await createMenuNodeService(req.body);

  return res.status(201).json({
    success: true,
    message: "Menu node created successfully",
    data: menuNode,
  });
});

const getMenuNodes = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === "true";
  const menuNodes = await getMenuNodesService({ includeInactive });

  return res.status(200).json({
    success: true,
    message: "Menu nodes fetched successfully",
    data: menuNodes,
  });
});

const getMyMenu = asyncHandler(async (req, res) => {
  const menus = await getMyMenuService(req.user.roles);

  return res.status(200).json({
    success: true,
    message: "Menu nodes fetched successfully",
    data: menus,
  });
});

const updateMenuNode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidMenuNodeId();
  }

  const menuNode = await updateMenuNodeService(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Menu node updated successfully",
    data: menuNode,
  });
});

const deleteMenuNode = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw ERR.invalidMenuNodeId();
  }

  await deleteMenuNodeService(id);

  return res.status(200).json({
    success: true,
    message: "Menu node deleted successfully",
  });
});

module.exports = {
  createMenuNode,
  getMenuNodes,
  getMyMenu,
  updateMenuNode,
  deleteMenuNode,
};
