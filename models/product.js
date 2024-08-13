const mongoose = require('mongoose'); 

const productSchema = new mongoose.Schema({
   
    name:{
        type:String,
        required:true,
       trim:true
      
    },
    discription:{
        type:String,
        required:true,
       
    },
    brand:{
        type:String,
       required:true
    },
    offerPrice:{
        type:Number,
    },
    price:{
        type:Number,
        required:true,
    },
    categary:{
        type:String,
       required:true,
    },
    quantity:{
        type:Number,     
        default:0
    },
    sold:{
        type:Number,
        default:0,
        select:false
    },
    saleStatus:{
        type:String,
    },
    savedPrice:{
        type:Number,
    },
    size:{
        type:String,
        default:"M"       
    },
   
    images:{
        type:Array,
    },
    color:{
        type:String,
       required:true
    },
    rating: {
        type:Object,
        average: {
            type:Number,
        }, 
        totalRatings: {
            type:Number
        },
        default: {
            average: 0,       
            totalRatings: 0,  
    },
},
    status:{
        type:Boolean,
        default:true
    },
   
    
},{timestamps:true});




//Export the model
module.exports = mongoose.model('Product', productSchema);