const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const addressSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(), // Automatically generate a new ObjectId
    },
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    pinCode: {
        type: Number,
        required: true,
    },
    addressLine: {
        type: String,
        required: true,
    },
    areaStreet: {
        type: String,
        required: false,
    },
    landmark: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    adressType: {
        type: String,
        default: "Home"
    },
    isMain: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
});



const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    mobile: {
        type: Number,
        required: false,
        sparse: true,
    },
    password: {
        type: String,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String
    },
    googleID: {
        type: String,
        unique: true,
        require: false,
        sparse: true,
    }
    ,
    isGoogle: {
        type: Boolean,
        default: false,
        sparse: true,

    },
    address:
        [addressSchema]
    ,
    cart: {
        cartItems: [{
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

            }
        }],
        discount: { type: Number, default: 0 },

        coupen: { type: String, default: 'no' }

    },
    coupens: {
        type: Array,
        coupenIds: [{
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Coupens'
        }]
        ,
        isActivated: {
            type: Boolean,
            default: false
        }
    },
    wishList: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product"
        },
    }],
    wallet: {
        type: Number,
        required: true,
        default: 0,
    },
    transactionHistory: [
        {
            method: {
                type: String,
                default: 'wallet'
            },
            date: {
                type: Date,
                default: Date.now()
            },
            amount: {
                type: Number,
                default: 0,
            },
            isCredited: {
                type: Boolean,
                default: true,
            },
            isDebited: {
                type: Boolean,
                default: false,
            }
        }
    ]


});



userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};






module.exports = mongoose.model('User', userSchema);