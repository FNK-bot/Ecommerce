const mongoose = require('mongoose');


// Declare the Schema of the Mongo model
const catogarySchema = new mongoose.Schema({
    image: {
        type: String,
        required: true,

    },
    name: {
        type: String,
        required: true,

    },
    discription: {
        type: String,
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
    isDeleted: {
        type: Boolean,
        default: false
    }

});


//Export the model
module.exports = mongoose.model('Catogary', catogarySchema);