const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  getIndiaStates,
  getIndiaDistricts,
  getIndiaPincodes,
  getIndiaPostOfficeAreas,
  getIndiaTaluks,
} = require("../controllers/location.controller");

const router = express.Router();

router.get(
  "/india/states",
  authMiddleware,
  getIndiaStates,
);

router.get(
  "/india/states/:stateId/districts",
  authMiddleware,
  getIndiaDistricts,
);

router.get(
  "/india/pincodes",
  authMiddleware,
  getIndiaPincodes,
);

router.get(
  "/india/taluks",
  authMiddleware,
  getIndiaTaluks,
);

router.get(
  "/india/post-offices",
  authMiddleware,
  getIndiaPostOfficeAreas,
);

module.exports = router;
 
