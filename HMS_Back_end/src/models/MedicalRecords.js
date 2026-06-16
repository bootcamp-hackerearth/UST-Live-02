const mongoose = require("mongoose");
const Counter = require("./Counter");

const medicalRecordSchema = new mongoose.Schema({
    medicalRecordId: {
        type: String,
        unique: true
    },
    appointmentId: {
        type: String,
        required: true,
        ref: "Appointments"
    },
    patientId: {
        type: String,
        required: true,
        ref: "Patients"
    },
    patientUHID: {
        type: String,
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    doctorEmployeeId: {
        type: String,
        required: true,
        ref: "Employees"
    },
    doctorName: {
        type: String,
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    diagnosis: {
        type: String,
        required: true
    },
    prescriptionItems: [{
        name: {type: String, required: true},
        dosage: {type: String, required: true},
        duration: {type: String, required: true}
    }],
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ["DRAFT", "FINALIZED"],
        default: "DRAFT"
    },
    // Creator details retained for audit messaging (staff-created -> doctor-finalized)
    createdByEmployeeId: {
        type: String
    },
    createdByName: {
        type: String
    },
    createdByDesignation: {
        type: String
    },
    // Soft-delete fields: absent until a deletion occurs (never null, never set at creation)
    isDeleted: {
        type: Boolean,
        default: undefined
    },
    deletedAt: {
        type: Date,
        default: undefined
    },
    deletedBy: {
        type: String,
        default: undefined
    }
}, {timestamps: { createdAt: "created_at", updatedAt: "updated_at" }}
);

// Pre-save hook to generate sequential medical record id
medicalRecordSchema.pre('save', async function () {
    if (this.isNew) {
            const counter = await Counter.findOneAndUpdate(
                { name: 'medicalRecord' },
                { $inc: { seq: 1 } }, // Creates sequence
                { new: true, upsert: true } // upsert is update and insert
            );
            this.medicalRecordId = `MEDREC-${String(counter.seq).padStart(6, '0')}`; // create 6 digit sequence number
    }
});

module.exports = mongoose.model("MedicalRecords", medicalRecordSchema);