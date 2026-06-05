const mongoose = require("mongoose");
const Counter = require("./Counter");

const patientSchema = new mongoose.Schema({
    patientId: { type: String, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: null },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    date_of_birth: { type: Date },
    emergencyContact: { type: String, default: null },
    address: {
        type: String
    },
    status: {
        type: String,
        enum: [
            "ACTIVE",
            "INACTIVE"
        ],
        default: "ACTIVE"
    }
}, {
    timestamps: {
        createdAt: "created_at",
    }
});

patientSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'Patient' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.patientId = `UHID-${String(counter.seq).padStart(4, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});
module.exports = mongoose.model("Patient", patientSchema);