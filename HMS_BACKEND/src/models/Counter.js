const mongoose = require("mongoose");

//COUNTER TO KEEP TRACK OF EACH UNIQUE ID
const counterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Counter", counterSchema);
