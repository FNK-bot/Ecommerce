const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')

const getShop = async (req,res)=>{
    try {

        
        const catagory= await Catagory.find()
        const product = await Product.find();
        const user = await User.findById(req.session.user_id)
        let totalProducts = product.length;
        const itemsperpage =totalProducts > 9 ? 9 :totalProducts;
        console.log('item per page'+itemsperpage)
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(totalProducts/9);
         currentproduct = product.slice(startindex,endindex);
       
        if(user){
            res.render("user-views/shop", { user, product:currentproduct ,catagory,totalpages,currentpage,totalProducts});
        }else{ 
            res.render("user-views/shop", { user:null, product:currentproduct , catagory,totalpages,currentpage,totalProducts});
        }
    } catch (error) {
       
        console.log('error in getShop error:',error)
    }
};

module.exports = getShop