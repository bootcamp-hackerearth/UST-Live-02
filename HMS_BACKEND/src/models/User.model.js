const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
    {

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
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
        passwordHash: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE'
        },

        roleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true
        },

        isVerified: {
            type: Boolean,
            default: false
        },
        lastLoginAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);



module.exports = mongoose.model('User', userSchema);

