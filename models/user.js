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
        default:"Home"
    },
    isMain: {
        type: Boolean,
        default: false,
    },
    isDeleted:{
        type:Boolean,
        default:false,
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
        required:false,
        sparse:true,
    },
    password: {
        type: String,
    },
    isAdmin: {
        type: String,
        default: "0",
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    image:{
        type:String
    },
    googleID:{
        type:String,
        unique:true,
    }
    ,
    isGoogle:{
      type:Boolean,
      default: false,
      sparse:true,

    },
    address:
        [addressSchema]
    ,
      cart:{
      type:Array,
        ProductId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        quantity:{
            type:Number,
            required:true,
        },
        size:{
            type:String,
        },
        total:{
            type:Number,
            required:true
        },
        subTotal:{
            type:Number,
            
        }
    },
        
   
});




userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};






module.exports = mongoose.model('User', userSchema);