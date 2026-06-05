const Counter = require("../models/Counter");

//FUNCTION TO CREATE UNIQUE ID WITH RESPECTIVE PRE-FIX
async function generateId(sequenceName, prefix) {
  const counter = await Counter.findOneAndUpdate(
    { name: sequenceName },
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true },
  );

  return `${prefix}-${String(counter.seq).padStart(6, "0")}`;
}

module.exports = generateId;
