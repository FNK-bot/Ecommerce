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
        default: () => {
            let createdDate = this.createdDate || new Date();
            return new Date(createdDate.setMonth(createdDate.getMonth() + 3))
        }
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
    }
});

module.exports = mongoose.model('Coupens', coupenSchema);