const mongoose = require('mongoose');

const joinUsSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            unique: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ['Doctor', 'Nurse', 'Receptionist', 'Pharmacist', 'Lab Technician'],
            required: true
        },

        department: {
            type: String,
            enum: ['OPD', 'IPD', 'Lab', 'Pharmacy', 'Admin', 'Front Office'],
            required: true
        },

        designation: {
            type: String,
            enum: ['Jr Doctor', 'Nurse', 'Receptionist', 'Administrator'],
            required: true
        },

        joiningDate: {
            type: Date,
            required: true
        },
        specialization: {
            type: String
        },

        qualification: {
            type: String
        },

        consultationFee: {
            type: Number
        },

        medicalRegistrationNo: {
            type: String
        },

        availabilityStartTime: {
            type: String
        },

        availabilityEndTime: {
            type: String
        },

        experienceYears: {
            type: Number
        },

        isVerified: {
            type: Boolean,
            default: false
        },

        verificationToken: {
            type: String
        },

        verificationTokenExpiry: {
            type: Date
        },

        approvalStatus: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        },

        rejectionReason: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.models.JoinUs || mongoose.model('JoinUs', joinUsSchema);