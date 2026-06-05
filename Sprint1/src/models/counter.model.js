const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    required: true,
    unique: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
  roleCode: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Counter", counterSchema);
