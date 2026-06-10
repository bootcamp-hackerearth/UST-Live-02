const mongoose = require('mongoose')
const doctorSchema = mongoose.Schema({

    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true,
    },
    specialization: {
        type: String,
        trim:true
    },
    qualification: {
        type: String,
        trim:true
    },
    consultationFee: {
        type: Number,
        required: true,
    },
    medicalRegistrationNo: {
        type: String,
        unique: true,
        required: true,
        trim:true
    },
    availabilityStartTime: {
        type: String,
    },
    availabilityEndTime: {
        type: String,
    },
    experienceYears: {
        type: Number,
        required: true,
    },

}, {
    timestamps: true
})

module.exports = mongoose.model('Doctor', doctorSchema)