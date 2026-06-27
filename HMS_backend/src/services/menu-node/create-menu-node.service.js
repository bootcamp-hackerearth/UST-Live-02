const MenuNode = require("../../models/MenuNode");
const ERR = require("../../utils/errors");

const createMenuNodeService = async (data) => {
  const existingNode = await MenuNode.findOne({ path: data.path });

  if (existingNode) {
    throw ERR.menuNodePathExists();
  }

  return MenuNode.create({
    label: data.label,
    path: data.path,
    parentId: data.parentId || null,
    icon: data.icon || "",
    allowedRoles: data.allowedRoles,
    order: data.order || 0,
    isActive: data.isActive ?? true,
  });
};

module.exports = createMenuNodeService;
