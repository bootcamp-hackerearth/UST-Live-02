const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: [
                "OWNER",
                "ADMIN",
                "DOCTOR",
                "RECEPTIONIST",
                "CASHIER",
                "NURSE",
                "LAB_TECH",
                "PHARMACIST"
            ]
        },

        employeeId: {
            type: String
        },

        isActive: {
            type: Boolean,
            default: false
        },

        verificationToken: {
            type: String
        },

        verificationTokenExpiry: {
            type: Date
        },

        lastLoginAt: {
            type: Date
        }
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at"
        }
    }
);

module.exports = mongoose.model("User", userSchema);