const mongoose = require('mongoose')
const Counter = require('./Counter.model')

const employeeSchema = mongoose.Schema(
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
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        department: {
            type: String,
            enum: [
                'OPD',
                'IPD',
                'LAB',
                'PHARMACY',
                'Admin',
                'Front Office'
            ],
            required: true,
        },
        designation: {
            type: String,
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        },
        joiningDate: {
            type: Date,
        }
    },
    {
        timestamps: true,
    }
);

employeeSchema.pre('validate', async function () {
    if (this.isNew && !this.employeeCode) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'employee' },
                { $inc: { seq: 1 } },
                {
                    returnDocument: 'after',
                    upsert: true
                }
            );

            this.employeeCode = `EMP-${String(counter.seq).padStart(6, '0')}`;
        } catch (error) {
            console.error(error);
        }
    }


});

module.exports = mongoose.model("Employee", employeeSchema);

