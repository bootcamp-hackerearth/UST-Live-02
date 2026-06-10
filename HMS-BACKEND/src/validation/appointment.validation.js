const { body } = require('express-validator');

exports.validateCreateAppointment = [
    body('patientId')
        .notEmpty()
        .withMessage('Patient is required')
        .isMongoId()
        .withMessage('Invalid patient ID'),

    body('doctorId')
        .notEmpty()
        .withMessage('Doctor is required')
        .isMongoId()
        .withMessage('Invalid doctor ID'),

    body('appointmentDate')
        .notEmpty()
        .withMessage('Appointment date is required')
        .isISO8601()
        .withMessage('Invalid appointment date'),

    body('timeSlot')
        .notEmpty()
        .withMessage('Time slot is required'),

    body('reason')
        .notEmpty()
        .withMessage('Reason is required')
        .trim()
];