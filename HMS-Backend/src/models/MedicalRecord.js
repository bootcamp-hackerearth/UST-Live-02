const mongoose = require("mongoose");
const Counter = require("./Counter");

const medicalrecordSchema = new mongoose.Schema({
    medicalRecordId: { type: String, unique: true, required: true },
    patientId: {
        type: String,
        ref: "Patient",
        required: true
    },
    appointmentId: {
        type: String,
        ref: "Appointment",
        required: true
    },
    doctorId: {
        type: String,
        ref: "Employee",
        required: true
    },
    symptoms: { type: String, required: true },
    diagnosis: { type: String, required: true },
    prescriptionItems: [
        {
            name: String,
            dosage: String,
            duration: String
        }
    ],

}, {
    timestamps: {
        createdAt: "created_at",
        default: Date.now
    }
});

medicalrecordSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'MedicalRecords' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.medicalRecordId = `MR-${String(counter.seq).padStart(4, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('MedicalRecords', medicalrecordSchema);