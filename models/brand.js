const mongoose = require('mongoose');


//create Brand Schema

const brandSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false,
    },
    offer: {
        status: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number,
            default: 0,
        }
    },
})

module.exports = mongoose.model('Brand', brandSchema)