const mongoose = require('mongoose');

const role = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        roleCode: {
            type: String,
            unique: true,
            uppercase: true,
            required: true
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Role', role);