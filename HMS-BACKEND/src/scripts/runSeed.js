require("dotenv").config();

const mongoose = require("mongoose");
const seedRoles = require("../utils/seedData");
const seedOwner = require("../utils/seedOwner");
const seedMenus = require("../utils/seedMenus");

const runSeed = async () => {
  try {
    console.log("DEBUG MONGO_URL:", process.env.MONGO_URL);

    await mongoose.connect(process.env.MONGO_URL);

    console.log("Connected to DB");

    await seedRoles();
    await seedOwner();
    await seedMenus();

    console.log("Seeding complete");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

runSeed();