const mongoose = require('mongoose');


// Schema of the Mongo model
let coupenSchema = new mongoose.Schema({
    createdDate: {
        required: true,
        type: Date,
        default: Date.now
    },
    expiry: {
        type: Date,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    percentage: {
        type: Number,
        default: 0,
    },
    isLive: {
        type: Boolean,
        default: true,
    },
    name: {
        type: String,
        required: true,
    },
    maxLimit: {
        type: Number,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Coupens', coupenSchema);