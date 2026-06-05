const mongoose = require("mongoose");
const Counter = require("./Counter");

const employeeSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true
        },

        name: {
            type: String,
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },

        department: {
            type: String,
            enum: ["OPD", "IPD", "LAB", "PHARMACY", "ADMIN"],
            required: true
        },

        designation: {
            type: String,
            enum: [
                "OWNER",
                "DOCTOR",
                "NURSE",
                "RECEPTIONIST",
                "CASHIER",
                "LAB_TECH",
                "PHARMACIST",
                "ADMIN"
            ],
            required: true
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "INACTIVE"
        },

        joiningDate: {
            type: Date,
            required: true
        },

        medicalRegistrationNumber: {
            unique: true,
            type: String,
            sparse: true
        },

        specialisation: {
            type: String
        },

        qualification: [
            {
                type: String,
                required: true
            }
        ],

        consultationFee: {
            type: Number,
            default: 0
        },

        availabilitySlots: [
            {
                day: {
                    type: Date
                },

                startTime: {
                    type: String
                },

                endTime: {
                    type: String
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

employeeSchema.pre("save", async function () {
    if (this.isNew) {
        const counter = await Counter.findOneAndUpdate(
            { name: "Employee" },
            { $inc: { seq: 1 } },
            {
                returnDocument: "after",
                upsert: true
            }
        );

        this.employeeId = `EMP-${String(counter.seq).padStart(6, "0")}`;
    }
});

module.exports = mongoose.model("Employee", employeeSchema);