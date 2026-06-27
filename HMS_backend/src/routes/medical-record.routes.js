const express = require("express");

const {
  getRecordPatients,
  getPrescriptions,
  getPatientPrescriptions,
  getMyPrescriptions,
  getPrescriptionById,
  getLabReports,
  getPatientLabReports,
  createLabReport,
  updateLabReport,
  deleteLabReport,
  createHealthRecord,
  getHealthRecords,
  getPatientHealthRecords,
  getMyHealthRecords,
  getHealthRecordById,
  updateHealthRecord,
  deleteHealthRecord,
} = require("../controllers/medical-record.controller");
const authMiddleware = require("../middleware/auth.middleware");
const healthRecordUpload = require("../middleware/health-record-upload.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

const router = express.Router();

router.get(
  "/patients",
  authMiddleware,
  permissionMiddleware("medical-record:patients"),
  getRecordPatients
);

router.get(
  "/health-records",
  authMiddleware,
  permissionMiddleware("medical-record:health-records"),
  getHealthRecords
);

router.post(
  "/health-records",
  authMiddleware,
  permissionMiddleware("medical-record:health-record-create"),
  healthRecordUpload.single("documentFile"),
  createHealthRecord
);

router.get(
  "/health-records/my",
  authMiddleware,
  permissionMiddleware("medical-record:health-records-my"),
  getMyHealthRecords
);

router.get(
  "/health-records/patient/:patientId",
  authMiddleware,
  permissionMiddleware("medical-record:health-records-patient"),
  getPatientHealthRecords
);

router.get(
  "/health-records/:id",
  authMiddleware,
  permissionMiddleware("medical-record:health-record-detail"),
  getHealthRecordById
);

router.put(
  "/health-records/:id",
  authMiddleware,
  permissionMiddleware("medical-record:health-record-update"),
  healthRecordUpload.single("documentFile"),
  updateHealthRecord
);

router.delete(
  "/health-records/:id",
  authMiddleware,
  permissionMiddleware("medical-record:health-record-delete"),
  deleteHealthRecord
);

router.get(
  "/prescriptions",
  authMiddleware,
  permissionMiddleware("medical-record:prescriptions"),
  getPrescriptions
);

router.get(
  "/prescriptions/my",
  authMiddleware,
  permissionMiddleware("medical-record:prescriptions-my"),
  getMyPrescriptions
);

router.get(
  "/prescriptions/patient/:patientId",
  authMiddleware,
  permissionMiddleware("medical-record:prescriptions-patient"),
  getPatientPrescriptions
);

router.get(
  "/prescriptions/:id",
  authMiddleware,
  permissionMiddleware("medical-record:prescription-detail"),
  getPrescriptionById
);

router.get(
  "/lab-reports",
  authMiddleware,
  permissionMiddleware("medical-record:lab-reports"),
  getLabReports
);

router.post(
  "/lab-reports",
  authMiddleware,
  permissionMiddleware("medical-record:lab-report-create"),
  healthRecordUpload.single("documentFile"),
  createLabReport
);

router.get(
  "/lab-reports/my",
  authMiddleware,
  permissionMiddleware("medical-record:lab-reports-my"),
  getLabReports
);

router.get(
  "/lab-reports/patient/:patientId",
  authMiddleware,
  permissionMiddleware("medical-record:lab-reports-patient"),
  getPatientLabReports
);

router.put(
  "/lab-reports/:id",
  authMiddleware,
  permissionMiddleware("medical-record:lab-report-update"),
  healthRecordUpload.single("documentFile"),
  updateLabReport
);

router.delete(
  "/lab-reports/:id",
  authMiddleware,
  permissionMiddleware("medical-record:lab-report-delete"),
  deleteLabReport
);

module.exports = router;
