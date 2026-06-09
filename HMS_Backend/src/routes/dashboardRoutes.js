const express = require("express");
const router = express.Router();
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireDesignation = require("../middlewares/requireDesignation");
const controller = require("../controllers/dashboardController");

router.use(authenticateRequest);

router.get(
    "/stats",
    controller.getDashboardStats
);

router.get(
    "/admin/stats",
    requireDesignation("OWNER", "ADMIN"),
    controller.getAdminDashboardStats
);

router.get(
    "/doctor/stats",
    requireDesignation("DOCTOR"),
    controller.getDoctorDashboardStats
);

router.get(
    "/receptionist/stats",
    requireDesignation("RECEPTIONIST"),
    controller.getReceptionistDashboardStats
);

router.get(
    "/appointments/stats",
    requireDesignation("OWNER", "ADMIN"),
    controller.getAppointmentStats
);

router.get(
    "/patients/stats",
    requireDesignation("OWNER", "ADMIN"),
    controller.getPatientStats
);

router.get(
    "/employees/stats",
    requireDesignation("OWNER", "ADMIN"),
    controller.getEmployeeStats
);

module.exports = router;