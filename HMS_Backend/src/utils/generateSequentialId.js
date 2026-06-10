const Counter = require("../models/Counter");

const generateSequentialId = async (prefix) => {
  const counter = await Counter.findOneAndUpdate(
    { name: prefix },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true },
  );

  const formattedSequence = String(counter.sequence).padStart(6, "0");

  return `${prefix}-${formattedSequence}`;
};

module.exports = generateSequentialId;
