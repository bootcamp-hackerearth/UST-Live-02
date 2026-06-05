const mongoose = require("mongoose");

// COUNTER SCHEMA
const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    seq: {
        type: Number,
        default: 0
    }
});


module.exports = mongoose.model("Counter", counterSchema);