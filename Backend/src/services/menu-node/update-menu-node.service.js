const MenuNode = require("../../models/MenuNode");
const ERR = require("../../utils/errors");

const updateMenuNodeService = async (id, data) => {
  const menuNode = await MenuNode.findById(id);

  if (!menuNode) {
    throw ERR.menuNodeNotFound();
  }

  if (data.path && data.path !== menuNode.path) {
    const existingNode = await MenuNode.findOne({
      _id: { $ne: id },
      path: data.path,
    });

    if (existingNode) {
      throw ERR.menuNodePathExists();
    }
  }

  const allowedFields = [
    "label",
    "path",
    "parentId",
    "icon",
    "allowedRoles",
    "order",
    "isActive",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      menuNode[field] = data[field];
    }
  });

  return menuNode.save();
};

module.exports = updateMenuNodeService;
