const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireDesignation = require("../middlewares/requireDesignation");
const controller = require("../controllers/patientController");
const {
    createPatientValidation,
    updatePatientValidation,
    uhidValidation
} = require("../validators/patientValidators");

router.use(authenticateRequest, requireDesignation("OWNER", "ADMIN", "RECEPTIONIST"));

router.post(
    "/create-patient",
    createPatientValidation,
    validateRequest,
    controller.createPatient
);

router.get(
    "/search",
    controller.searchPatients
);

router.get(
    "/",
    controller.getPatients
);

router.get(
    "/:UHID",
    uhidValidation,
    validateRequest,
    controller.getPatientById
);

router.put(
    "/:UHID",
    updatePatientValidation,
    validateRequest,
    controller.updatePatient
);

module.exports = router;