const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const nodePermissionMiddleware = require("../middleware/node-permission.middleware");

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
  nodePermissionMiddleware,
  getIndiaStates,
);

router.get(
  "/india/states/:stateId/districts",
  authMiddleware,
  nodePermissionMiddleware,
  getIndiaDistricts,
);

router.get(
  "/india/pincodes",
  authMiddleware,
  nodePermissionMiddleware,
  getIndiaPincodes,
);

router.get(
  "/india/taluks",
  authMiddleware,
  nodePermissionMiddleware,
  getIndiaTaluks,
);

router.get(
  "/india/post-offices",
  authMiddleware,
  nodePermissionMiddleware,
  getIndiaPostOfficeAreas,
);

module.exports = router;
 
