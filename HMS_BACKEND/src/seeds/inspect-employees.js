const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const mongoose = require("mongoose");
const Employee = require("../models/Employee");

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);

  const total = await Employee.countDocuments({});
  console.log(`Total Employee documents: ${total}`);

  const designations = await Employee.distinct("designation");
  console.log("Distinct designation values:", designations);

  const statuses = await Employee.distinct("status");
  console.log("Distinct status values:", statuses);

  const sample = await Employee.find({})
    .limit(5)
    .select("name designation status isDeleted department");

  console.log("Sample employees:");

  sample.forEach((e) => {
    console.log(
      `name=${e.name} | designation=${e.designation} | status=${e.status} | isDeleted=${e.isDeleted} | department=${e.department}`,
    );
  });

  process.exit(0);
}

try {
  await inspect();
} catch (err) {
  console.error(err);
  process.exit(1);
}