const mongoose = require('mongoose');
const userSchemea = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive", "Pending"] },
    role: {
        type: String,
        enum: ["Admin", "Doctor", "Receptionist", "Cashier", "Nurse", "Lab_tech", "Pharmicist"],
        required: true
    },
    employeeId: {
        type: String,
        ref: 'Employee',
        required: true
    },
    lastLoginAt: { type: Date, default: null }
},
    {
        timestamps: true
    });

module.exports = mongoose.model('User', userSchemea);