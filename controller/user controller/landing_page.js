const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')

const getLanding = async (req,res)=>{
    try {
        const user = req.session.user_id;
        const catagory= await Catagory.find().limit(3)
        const product = await Product.find().limit(6);
        req.session.Product = product;
        if(user){
            const userdata=await User.findById(user)
            res.render("user-views/index", { user:userdata, product ,catagory});

        }else{ 
            res.render("user-views/index", { user:null, product , catagory});
        }
    } catch (error) {
       
        console.log('error in getLanding error:',error)
    }
}

module.exports = getLanding