const MenuNode = require("../../models/MenuNode");
const ERR = require("../../utils/errors");

const deleteMenuNodeService = async (id) => {
  const menuNode = await MenuNode.findById(id);

  if (!menuNode) {
    throw ERR.menuNodeNotFound();
  }

  menuNode.isActive = false;

  return menuNode.save();
};

module.exports = deleteMenuNodeService;
