const express = require("express");

const router = express.Router();

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
} = require("../controllers/patient.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const validateMiddleware = require("../middleware/validate.middleware");

const {
  createPatientValidation,
  updatePatientValidation,
} = require("../validations/patient.validation");

// Register a new patient
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  createPatientValidation,
  validateMiddleware,
  createPatient
);

// Get all patients
router.get(
  "/",
  authMiddleware,
  getPatients
);

// Get patient details by ID
router.get(
  "/:id",
  authMiddleware,
  getPatientById
);

// Update patient information
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  updatePatientValidation,
  validateMiddleware,
  updatePatient
);

module.exports = router;