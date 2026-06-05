const mongoose = require('mongoose');
const doctor = mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
            unique:true,
        },
        specialization: {
            type: String,
        },
        qualification: {
            type: String,
        },
        availabilityStartTime: {
            type: String,
        },
        availabilityEndTime: {
            type: String,
        },
        consultationFee: {
            type: Number,
            required: true,
        },
        medicalRegistrationNo: {
            type: String,
            unique: true,
            required: true,
        },
        experienceYears: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)
module.exports = mongoose.model('Doctor',doctor);