const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireDesignation = require("../middlewares/requireDesignation");
const controller = require("../controllers/employeeController");
const { phoneValidator } = require("../validators/sharedValidators");
const { qualificationValidator } = require("../validators/employeeValidators");

router.use(authenticateRequest);

const profileUpdateValidation = [
    phoneValidator("phone", { optional: true }),
    qualificationValidator("qualification", { optional: true })
];

router.get(
    "/me",
    controller.getMe
);

router.get(
    "/doctors",
    requireDesignation("OWNER", "ADMIN", "RECEPTIONIST"),
    controller.getDoctors
);

router.put(
    "/update-profile",
    profileUpdateValidation,
    validateRequest,
    controller.profileUpdate
);

module.exports = router;