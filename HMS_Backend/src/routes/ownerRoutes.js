const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireRole = require("../middlewares/requireRole");
const controller = require("../controllers/ownerController");
const {
    nameValidator,
    phoneValidator,
    emailValidator,
} = require("../validators/sharedValidators");
const {
    usernameValidator,
    qualificationValidator,
    joiningDateValidator,
} = require("../validators/employeeValidators");

router.use(authenticateRequest, requireRole("OWNER"));

const adminCreationValidation = [

    usernameValidator(),

    nameValidator("name", "Name"),

    phoneValidator("phone"),

    emailValidator("email"),

    body("department")
        .equals("Administration")
        .withMessage("Admin must belong to Administration department"),

    body("designation")
        .equals("ADMIN")
        .withMessage("Designation must be ADMIN"),

    joiningDateValidator(),

    qualificationValidator()
];

const employeeCodeValidation = [
    param("employeeCode")
        .notEmpty()
        .withMessage("Employee Code is required")
];

const adminUpdateValidation = [
    ...employeeCodeValidation,
    nameValidator("name", "Name", { optional: true })
];

router.post(
    "/create-admin",
    adminCreationValidation,
    validateRequest,
    controller.createAdmin
);

router.get(
    "/admins",
    controller.getAdmins
);

router.put(
    "/update-admin/:employeeCode",
    adminUpdateValidation,
    validateRequest,
    controller.updateAdmin
);

router.delete(
    "/delete-admin/:employeeCode",
    employeeCodeValidation,
    validateRequest,
    controller.deleteAdmin
);

module.exports = router;