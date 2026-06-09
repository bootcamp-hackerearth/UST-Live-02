const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireRole = require("../middlewares/requireRole");
const controller = require("../controllers/nodeController");
const { STAFF_DESIGNATIONS, RESTRICTED_ROLES } = require("../config/constants");

router.use(authenticateRequest);

const createNodeValidation = [

    body("name")
        .notEmpty()
        .withMessage("Node name is required"),

    body("path")
        .notEmpty()
        .withMessage("Node path is required")
        .matches(/^\/.*/)
        .withMessage("Path must start with /"),

    body("allowedDesignations")
        .isArray({ min: 1 })
        .withMessage("At least one allowed designation is required"),

    body("allowedDesignations.*")
        .isIn([...STAFF_DESIGNATIONS, ...RESTRICTED_ROLES])
        .withMessage("Valid designation is required")
];

const updateNodeValidation = [

    param("nodeId")
        .notEmpty()
        .withMessage("Node ID is required"),

    body("name")
        .optional()
        .notEmpty()
        .withMessage("Node name cannot be empty"),

    body("path")
        .optional()
        .notEmpty()
        .withMessage("Node path cannot be empty")
        .matches(/^\/.*/)
        .withMessage("Path must start with /"),

    body("allowedDesignations")
        .optional()
        .isArray({ min: 1 })
        .withMessage(
            "At least one allowed designation is required"
        ),

    body("allowedDesignations.*")
        .optional()
        .isIn([...STAFF_DESIGNATIONS, ...RESTRICTED_ROLES])
        .withMessage("Valid designation is required")
];

const nodeIdValidation = [

    param("nodeId")
        .notEmpty()
        .withMessage("Node ID is required")
];

router.post(
    "/create-node",
    requireRole("ADMIN", "OWNER"),
    createNodeValidation,
    validateRequest,
    controller.createNode
);

router.put(
    "/update-node/:nodeId",
    requireRole("ADMIN", "OWNER"),
    updateNodeValidation,
    validateRequest,
    controller.updateNode
);

router.delete(
    "/delete-node/:nodeId",
    requireRole("ADMIN", "OWNER"),
    nodeIdValidation,
    validateRequest,
    controller.deleteNode
);

router.get(
    "/my-nodes",
    controller.getMyNodes
);

module.exports = router;
