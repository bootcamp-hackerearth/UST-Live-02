const { body } = require('express-validator');

exports.createHealthRecordValidation = [
  body('appointmentId')
    .notEmpty()
    .withMessage('Appointment ID is required'),

  body('diagnosis')
    .notEmpty()
    .withMessage('Diagnosis is required'),

  body('prescription')
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),

  body('prescription.*.name')
    .notEmpty()
    .withMessage('Medicine name is required'),

  body('prescription.*.dosage')
    .notEmpty()
    .withMessage('Dosage is required'),

  body('prescription.*.duration')
    .notEmpty()
    .withMessage('Duration is required')
];

exports.updateHealthRecordValidation = [
  body('diagnosis')
    .notEmpty()
    .withMessage('Diagnosis is required'),

  body('prescription')
    .isArray({ min: 1 })
    .withMessage('At least one medicine is required'),

  body('prescription.*.name')
    .notEmpty()
    .withMessage('Medicine name is required'),

  body('prescription.*.dosage')
    .notEmpty()
    .withMessage('Dosage is required'),

  body('prescription.*.duration')
    .notEmpty()
    .withMessage('Duration is required')
];