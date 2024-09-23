const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true

    },
    discription: {
        type: String,

    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: true
    },
    categary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Catogary',
        required: true,
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
    price: {//current price
        type: Number,
        required: true,
    },
    actualPrice: {// row price
        set: {
            type: Boolean,
            default: false
        },
        amount: {
            type: Number
        }
    },

    quantity: {
        type: Number,
        default: 0
    },

    saleStatus: {
        type: String,
    },
    savedPrice: {
        type: Number,
    },
    size: {
        type: String,
        default: "M"
    },

    images: {
        type: Array,
    },
    color: {
        type: String,
        required: true
    },
    rating: {
        type: Object,
        average: {
            type: Number,
        },
        totalRatings: {
            type: Number
        },
        default: {
            average: 0,
            totalRatings: 0,
        },

    },
    status: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }



}, { timestamps: true });




//Export the model
module.exports = mongoose.model('Product', productSchema);