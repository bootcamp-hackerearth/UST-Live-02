const mongoose = require("mongoose");
require("dotenv").config();

async function fixUsers() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");

  // Clear problematic collections
  await mongoose.connection.collection("users").deleteMany({});
  await mongoose.connection.collection("employees").deleteMany({});
  await mongoose.connection.collection("counters").deleteMany({});
  await mongoose.connection.collection("refreshtokens").deleteMany({});

  console.log("Cleared users, employees, counters, refreshtokens");
  await mongoose.disconnect();
  console.log("Done — now run seed.js");
}

fixUsers().catch(console.error);
