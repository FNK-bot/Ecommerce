const Product = require('../../models/product')
const User = require('../../models/user')
const { isValidObjectId } = require('mongoose');

const getSingleProduct = async (req, res) => {
    try {
        const product_id = req.query.product;

        // Check if product_id exists in the query and is it valid id (santizing)
        if (!product_id || !isValidObjectId(product_id)) {
            return res.status(404).render('error-responses/404', {
                title: 'Page Not Found',
                message: 'Sorry, the page you are looking for does not exist.'
            });
        }

        const user = req.session.user_id || null;

        //fetching Suggested or Recommended products
        const suggestedProducts = await Product.find({ isDeleted: false })
            .limit(4).populate({ path: 'brand', select: 'name', strictPopulate: false });

        //fetching Product by id
        const product = await Product.findById(product_id)
            .populate({ path: 'brand', select: 'name', strictPopulate: false });

        //check is the product is there or is it soft Deleted, And the logic
        if (product.isDeleted || !product) {
            return res.status(404).render('error-responses/404', {
                title: 'Page Not Found',
                message: 'Sorry, the page you are looking for does not exist.'
            });
        }

        let userData = null;
        if (user) {
            // feching user data is user id is in session 
            userData = await User.findById(user);
        }

        return res.render("user-views/single_product", {
            user: userData, product,
            sProduct: suggestedProducts, //sProduct is suggested Products 
        });

    } catch (error) {
        console.error(`Error in getSingleProduct :`, error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = getSingleProduct;