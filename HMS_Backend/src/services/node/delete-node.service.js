const Node = require("../../models/Node");
const ApiError = require("../../utils/ApiError");

const deleteNodeService = async (id, userId) => {
  const node = await Node.findOneAndUpdate(
    {
      _id: id,
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedBy: userId,
      deletedAt: new Date(),
    },
    {
      returnDocument: "after",
    },
  );

  if (!node) {
    throw new ApiError(404, "Node not found", "NODE_NOT_FOUND");
  }

  return {
    message: "Node deleted successfully",
  };
};

module.exports = deleteNodeService;
