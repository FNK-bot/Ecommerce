const mongoose = require('mongoose');


// Schema of the Mongo model
let coupenSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Admin', coupenSchema);