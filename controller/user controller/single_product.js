const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')


const getSingleProduct = async (req,res)=>{
    try {
        const product_id = req.query.product;
        const user = req.session.user_id;
        const suggestedProducts = await Product.find().limit(4);
        const product = await Product.findById(product_id)
        if(user){
            const userdata=await User.findById(user)
            res.render("user-views/single_product", { user:userdata, product ,
                sProduct:suggestedProducts});

        }else{ 
            res.render("user-views/single_product", { user:null, product ,
                sProduct:suggestedProducts});
        }
    } catch (error) {
       
        console.log('error in getLanding error:',error)
    }
}


module.exports =getSingleProduct;