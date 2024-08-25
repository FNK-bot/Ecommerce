const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user');


const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id)
        const wishList = user.wishList.map((item) => item.productId)
        console.log('User wuishList ', wishList);
        const wishlistProducts = await Product.find({ _id: { $in: wishList } });
        console.log('whislist products list', wishlistProducts)
        res.render('user-views/wishlist', { user, wishList: wishlistProducts })
    } catch (error) {
        console.log('Error in get whishList Error', error)
    }
};


const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id)
        const productId = req.query.id;
        console.log('prId', productId)
        const alreadyExist = user.wishList.find((item) => item.productId.toString() === productId);

        if (alreadyExist) {
            console.log('product already exist in wishlist');
            res.status(200).json({ msg: 'product already exist in wishlist', type: 'info' })
        }
        else {
            const findProduct = await Product.findById(productId);
            if (findProduct) {
                user.wishList.push({
                    productId: findProduct._id
                });
                await user.save()
                console.log('product wishlist   pr:', findProduct);
                res.status(200).json({ msg: 'product  added to wishlist', type: 'success' })
            }
            console.log('product Id is not walid pid:', productId);
            res.status(200).json({ msg: 'product data  is not valid', type: 'error' })
        }
        // res.render('user-views/wishlist')
    } catch (error) {
        console.log('Error while adding to whishList Error', error)
    }
};


const deleteWishlist = async (req, res) => {
    try {
        console.log('Starting wishlist deletion process');

        const user = await User.findById(req.session.user_id);
        const productId = req.query.id;
        console.log('Product ID to delete:', productId);

        // Find the item in the wishlist
        const alreadyExist = user.wishList.find((item) => item.productId.toString() === productId);

        if (alreadyExist) {
            console.log('Product found in wishlist, proceeding to delete');
            // Filter out the item with the matching productId
            user.wishList = user.wishList.filter(item => item.productId.toString() !== productId);

            // Save the updated document
            await user.save();
            console.log('Product deleted from wishlist:', user.wishList);
            res.redirect('/wishlist')

        } else {
            console.log('Product not found in wishlist');
            res.redirect('/wishlist')

        }
    } catch (error) {
        console.log('Error while deleting item from wishlist:', error);

    }
};


module.exports = { getWishlist, addToWishlist, deleteWishlist };