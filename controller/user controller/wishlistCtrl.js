const Product = require('../../models/product')
const User = require('../../models/user');
const { isValidObjectId } = require('mongoose');

const getWishlist = async (req, res) => {
    try {
        //Fetch User Data
        const user = await User.findOne({ _id: req.session.user_id })
            .populate('wishList.productId');

        const wishList = user.wishList;

        //page contrl
        let wishListLength = wishList.length;
        const itemsperpage = wishListLength > 3 ? 3 : wishListLength;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(wishListLength / 3);
        let currentList = wishList.slice(startindex, endindex);

        //return response
        res.render('user-views/wishlist', { user, wishListItems: currentList, totalpages, currentpage })
    } catch (error) {

        console.error('Error in get whishList Error', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
};

//Add to whish List 
const addToWishlist = async (req, res) => {
    try {
        const productId = req.query.id || null;

        //Check is object id is valid
        if (!productId || !isValidObjectId(productId)) {
            return res.status(400).json({ msg: 'Product Not Found', type: 'info' })
        }

        const user = await User.findById(req.session.user_id)

        //check if Product is there in wishlist
        const alreadyExist = user.wishList.find((item) => item.productId.toString() === productId);

        //if there return response 
        if (alreadyExist) {
            return res.status(200).json({ msg: 'product already exist in wishlist', type: 'info' })
        } else {

            //Else add Product to wishlist if Product not Deleted
            const findProduct = await Product.findOne({ _id: productId, isDeleted: false });
            if (findProduct) {
                user.wishList.push({
                    productId: findProduct._id
                });
                await user.save()
                return res.status(200).json({ msg: 'Product  Added to wishlist', type: 'success' })
            }
            // else return response not found
            return res.status(200).json({ msg: 'Product Not found or Deleted', type: 'error' })
        }

    } catch (error) {

        console.error('Error while adding to whishList Error', error)
        res.status(500).json({ message: 'internal Server Error' });

    }
};

//Delete whishlist item
const deleteWishlist = async (req, res) => {
    try {

        const user = await User.findById(req.session.user_id);
        const wishListId = req.body.id || false;


        //Check is object id is valid
        if (!wishListId || !isValidObjectId(wishListId)) {
            return res.status(400).json({ msg: 'Product Not Found', type: 'info' })
        }

        // Find the item in the wishlist
        const isExist = user.wishList.id(wishListId)

        if (isExist) {
            // Find and pull the whishlist item
            await User.findOneAndUpdate({ _id: req.session.user_id },
                {
                    $pull: { wishList: { _id: wishListId } }
                },
                { new: true }
            )

            return res.status(200).json({ msg: 'Item  in wishlist', type: 'success' });

        } else {

            return res.status(404).json({ msg: 'Item not found in wishlist', type: 'error' });
        }
    } catch (error) {

        console.error('Error while deleting item from wishlist:', error);
        res.status(500).json({ message: 'internal Server Error' });

    }
};


module.exports = { getWishlist, addToWishlist, deleteWishlist };