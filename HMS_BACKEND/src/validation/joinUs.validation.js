const { body } = require('express-validator');

exports.validateCreateJoinUs = [
    body('firstName')
        .notEmpty()
        .withMessage('First name is required'),

    body('lastName')
        .notEmpty()
        .withMessage('Last name is required'),

    body('email')
        .isEmail()
        .withMessage('Valid email is required'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    body('phone')
        .notEmpty()
        .withMessage('Phone number is required'),

    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Technician'])
        .withMessage('Invalid role selected'),

    body('department')
        .notEmpty()
        .withMessage('Department is required')
        .isIn(['OPD', 'IPD', 'Lab', 'Pharmacy', 'Admin', 'Front Office'])
        .withMessage('Invalid department selected'),

    body('designation')
        .notEmpty()
        .withMessage('Designation is required')
        .isIn(['Jr Doctor', 'Nurse', 'Receptionist', 'Administrator'])
        .withMessage('Invalid designation selected'),

    body('joiningDate')
        .notEmpty()
        .withMessage('Joining date is required')
        .isISO8601()
        .withMessage('Invalid joining date'),

    body('specialization')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Specialization is required for doctor'),

    body('qualification')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Qualification is required for doctor'),

    body('consultationFee')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Consultation fee is required for doctor')
        .isNumeric()
        .withMessage('Consultation fee must be a number'),

    body('medicalRegistrationNo')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Medical registration number is required for doctor'),

    body('availabilityStartTime')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Availability start time is required for doctor'),

    body('availabilityEndTime')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Availability end time is required for doctor'),

    body('experienceYears')
        .if(body('role').equals('Doctor'))
        .notEmpty()
        .withMessage('Experience years is required for doctor')
        .isNumeric()
        .withMessage('Experience years must be a number')
];