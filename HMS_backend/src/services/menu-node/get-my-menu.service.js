const MenuNode = require("../../models/MenuNode");

const getMyMenuService = async (roles = []) => {
  const menuNodes = await MenuNode.find({
    isActive: true,
    allowedRoles: { $in: roles },
  }).sort({ order: 1, label: 1 });

  const nodeMap = new Map();
  const menuTree = [];

  menuNodes.forEach((node) => {
    nodeMap.set(node._id.toString(), {
      ...node.toObject(),
      children: [],
    });
  });

  menuNodes.forEach((node) => {
    const currentNode = nodeMap.get(node._id.toString());
    const parentId = node.parentId?.toString();

    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId).children.push(currentNode);
      return;
    }

    menuTree.push(currentNode);
  });

  return menuTree;
};

module.exports = getMyMenuService;
