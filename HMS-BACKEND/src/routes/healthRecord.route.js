const express = require('express');
const router = express.Router();

const healthRecordController = require('../controller/healthRecord.controller');

const authMiddleware = require('../middleware/authMiddleware');
const authRoles = require('../middleware/authRoles');
const validate = require('../middleware/validate');

const permissions = require('../utils/permissions');

const {
  createHealthRecordValidation,
  updateHealthRecordValidation
} = require('../validation/healthRecord.validation');

router.post(
  '/create',
  authMiddleware,
  authRoles(permissions.ADD_HEALTH_RECORD),
  createHealthRecordValidation,
  validate,
  healthRecordController.createHealthRecord
);

router.get(
  '/list',
  authMiddleware,
  authRoles(permissions.VIEW_HEALTH_RECORD),
  healthRecordController.getHealthRecords
);

router.get(
  '/:id',
  authMiddleware,
  authRoles(permissions.VIEW_HEALTH_RECORD),
  healthRecordController.getHealthRecordById
);

router.put(
  '/update/:id',
  authMiddleware,
  authRoles(permissions.UPDATE_HEALTH_RECORD),
  updateHealthRecordValidation,
  validate,
  healthRecordController.updateHealthRecord
);

router.put(
  '/finalize/:id',
  authMiddleware,
  authRoles(permissions.FINALIZE_HEALTH_RECORD),
  healthRecordController.finalizeHealthRecord
);

router.delete(
  '/delete/:id',
  authMiddleware,
  authRoles(permissions.DELETE_HEALTH_RECORD),
  healthRecordController.softDeleteHealthRecord
);

module.exports = router;