const mongoose = require('mongoose'); // Erase if already required





// Declare the Schema of the Mongo model
var oderSchema = new mongoose.Schema({
    orderID:{
        required:true,
        type:Number,
        unique:true,

    },
    totalPrice:{
        required:true,
        type:Number
    },
    size:{  
        type:String 
    },
    createdOn:{
        required:true, 
        type:Date,
        default:Date.now
    },
    date:{
        required:true,
        type:String,

    },
    productId:{
        required:true,
        type:Array
    },
    userId:{
        required:true,
        type:String

    },
    method:{
        required:true,
        type:String,
    },
    status:{
        required:true,
        type:String
    },
    addressId:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false,
    }
    
});





//Export the model
module.exports = mongoose.model('Oder', oderSchema);