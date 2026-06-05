const mongoose = require('mongoose');

const employee = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        employeeCode: {
            type: String,
            unique: true,
            required: true,
        },
        department: {
            type: String,
            enum: [
                'OPD',
                'IPD',
                'LAB',
                'PHARMACY',
                'ADMIN'
            ],
            required: true,
        },
        designation: {
            type: String,
        },
        status: {
            type: Boolean,
            required: true,
        },
        joiningDate: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model('Employee', employee);