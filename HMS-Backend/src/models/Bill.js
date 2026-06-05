const mongoose = require("mongoose");
const Counter = require("./Counter");

const billSchema = new mongoose.Schema({
    billId: { type: String, unique: true },
    patientId: {
        type: String,
        ref: "Patient",
        required: true
    },
    appointmentId: {
        type: String,
        ref: "Appointment",
    },
    items: [
        {
            serviceName: String,
            amount: Number
        }
    ],
    total: { type: Number },
    status: {
        type: String,
        enum: ["Pending", "Paid", "Partial"],
        required: true
    },
    createdByEmployeedId: {
        type: String,
        ref: "Employee"
    }
}, {
    timestamps: {
        createdAt: "created_at",
    }
});

billSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'Bill' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            this.billId = `BILLNO-${String(counter.seq).padStart(4, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

module.exports = mongoose.model('Bill', billSchema);