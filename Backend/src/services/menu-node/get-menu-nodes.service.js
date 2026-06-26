const MenuNode = require("../../models/MenuNode");

const getMenuNodesService = async ({ includeInactive = false } = {}) => {
  const filter = includeInactive ? {} : { isActive: true };

  return MenuNode.find(filter).sort({ order: 1, label: 1 });
};

module.exports = getMenuNodesService;
