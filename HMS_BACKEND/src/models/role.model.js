const mongoose = require('mongoose');

const role = mongoose.Schema(
    {
        roleCode: {
            type: String,
            unique: true,
            uppercase: true,
            required: true
        },
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Role', role);