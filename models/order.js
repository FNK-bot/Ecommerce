const mongoose = require('mongoose');


// Schema of the Mongo model
let oderSchema = new mongoose.Schema({
    orderID: {
        required: true,
        type: Number,
        unique: true,

    },
    totalPrice: {
        required: true,
        type: Number
    },
    size: {
        type: String
    },
    createdOn: {
        required: true,
        type: Date,
        default: Date.now
    },
    date: {
        required: true,
        type: String,

    },
    productId: {
        required: true,
        type: Array
    },
    userId: {
        required: true,
        type: String

    },
    method: {
        required: true,
        type: String,
    },
    status: {
        required: true,
        type: String
    },
    address: {
        type: Object,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    discount: {
        type: Number,
        default: 0,
    },
    userName: {
        type: String,
        required: true,

    },
});





//Export the model
module.exports = mongoose.model('Oder', oderSchema);