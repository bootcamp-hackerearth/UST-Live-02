const mongoose = require('mongoose')

const roleSchema = new mongoose.Schema({

    roleCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    basePath: {
    type: String,
    required: true,
    trim: true
}

},
{
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    });


module.exports = mongoose.model('Role', roleSchema);