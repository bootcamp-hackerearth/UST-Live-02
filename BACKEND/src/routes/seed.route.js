const express = require("express");
const router = express.Router();

const seedRoles = require("../utils/seedData");
const seedOwner = require("../utils/seedOwner");
const seedMenus = require("../utils/seedMenus");

router.post("/run", async (req, res) => {
  const secret = req.headers["x-seed-secret"];

  if (secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await seedRoles();
    await seedOwner();
    await seedMenus();
    return res.status(200).json({ success: true, message: "Seeding complete" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;