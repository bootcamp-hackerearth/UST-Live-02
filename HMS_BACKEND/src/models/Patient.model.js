const mongoose = require('mongoose')
const Counter = require('./Counter.model')


const patientSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        sparse: true
    },
    UHID: {
        type: String,
        unique: true,
    },

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
    phone: {
        type: String,
        required: true,
        trim: true
    },

    gender: {
        type: String,
        enum: ['MALE', 'FEMALE', 'OTHER'],
        required: true
    },

    dob: {
        type: Date,
        required: true
    },
    bloodGroup: {
        type: String,
        enum: [
            'A+',
            'A-',
            'B+',
            'B-',
            'AB+',
            'AB-',
            'O+',
            'O-'
        ],
        required: true

    },

    address: {
        city: { type: String },
        state: { type: String },
        pincode: { type: String }
    },

    emergencyContactName: {
        type: String,
        required: true,
        trim: true
    },

    emergencyContactPhone: {
        type: String,
        required: true,
    },

    createdBy:
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},
    {
        timestamps: true
    });

patientSchema.pre('save', async function () {

    if (this.isNew) {

        try {

            const counter = await Counter.findOneAndUpdate(
                { name: 'UHID' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );

            this.UHID =
                `UHID-${String(counter.seq).padStart(6, '0')}`;

        } catch (error) {
            console.error(error);
        }
    }
});

module.exports = mongoose.model('Patient', patientSchema);