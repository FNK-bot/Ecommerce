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
        default: Date.now()
    },
    date: {
        required: true,
        type: String,//formated date

    },
    productId: {
        required: true,
        type: Array
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,

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

    isReturned: {
        status: {
            type: Boolean,
            default: false,
        },
        isRefunded: {
            type: Boolean,
            default: false,
        },
        refundAmount: {
            type: Number,
            default: 0,
        }
    },
    productDetails: [{
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "Product"
        },
        quantity: {
            type: Number,

        },
        size: {
            type: String,
        },
        total: {
            type: Number,

        },
        status: {
            type: String,
            default: 'Placed'
        },
    }],
    shippingCharge: {
        type: Number,
        default: 0,
    },
    onlinePayment: {
        paymentId: {
            type: String,
        },
        status: {
            type: String,
        },
        isOnlinePayment: {
            type: Boolean,
            default: false,
        },
        orderId: {
            type: String,
        }
    }

});





//Export the model
module.exports = mongoose.model('Oder', oderSchema);