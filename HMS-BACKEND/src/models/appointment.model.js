const mongoose = require('mongoose');
const Counter = require('./Counter.model');

const appointmentSchema = new mongoose.Schema(
    {
        appointmentCode: {
            type: String,
            unique: true
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        timeSlot: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["BOOKED", "COMPLETED", "CANCELLED","UNATTENDED"],
            default: "BOOKED"
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

appointmentSchema.pre('save', async function () {
    if (this.isNew && !this.appointmentCode) {
        const counter = await Counter.findOneAndUpdate(
            { name: 'appointment' },
            { $inc: { seq: 1 } },
            {
                returnDocument: 'after',
                upsert: true
            }
        );

        this.appointmentCode = `APT-${String(counter.seq).padStart(6, '0')}`;
    }
});

module.exports =
  mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);