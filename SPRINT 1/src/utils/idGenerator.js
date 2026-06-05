const { customAlphabet } = require("nanoid");
const Counter = require("../models/counter.model");
const Role = require("../models/role.model");
const ApiError = require("./ApiError");
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 5);

const generateId = async (roleCode) => {
  console.log("Generating ID for role code : ", roleCode);
  const role = await Role.findOne({ roleCode });
  if (!role) {
    throw new ApiError(404, "role not found");
  }
  console.log(role);
  const roleId = role._id;
  const counter = await Counter.findOneAndUpdate(
    { roleId },
    {
      $inc: { seq: 1 },
      $setOnInsert: {
        roleCode,
      },
    },
    {
      new: true,
      upsert: true,
    },
  );
  const padding = 6;
  const formattedSeq = String(counter.seq).padStart(padding, "0");

  return `${roleCode}-${formattedSeq}`;
};
module.exports = generateId;
