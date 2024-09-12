const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const Brand = require('../../models/brand')


const getSingleProduct = async (req, res) => {
    try {
        const product_id = req.query.product;
        const user = req.session.user_id;
        const suggestedProducts = await Product.find({ isDeleted: false }).limit(4);
        const sbrand_ids = suggestedProducts.map((item) => item.brand);
        const sbrand = await Brand.find({ _id: { $in: sbrand_ids } });

        const product = await Product.findById(product_id)
        const brand = await Brand.findById(product.brand);

        if (user) {
            const userdata = await User.findById(user)
            res.render("user-views/single_product", {
                user: userdata, product, brand,
                sProduct: suggestedProducts, sbrand
            });

        } else {
            res.render("user-views/single_product", {
                user: null, product, brand,
                sProduct: suggestedProducts, sbrand
            });
        }
    } catch (error) {

        console.log('error in getLanding error:', error)
    }
}


module.exports = getSingleProduct;