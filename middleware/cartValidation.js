const User = require('../models/user');
const Product = require('../models/product');

const checkCartQuantities = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user_id).populate('cart.cartItems.ProductId');
        // If user not found or cart is empty, redirect to cart page
        if (!user || user.cart.cartItems.length === 0) {
            return res.redirect('/cart');
        }

        let cartHasExceededQuantity = false;
        let updatedCart = false;

        for (let item of user.cart.cartItems) {
            // If product is not found for any cart item, redirect to cart
            if (!item.ProductId) {
                return res.redirect('/cart');
            }

            const cartQuantity = item.quantity;
            const availableQuantity = item.ProductId.quantity;

            // If any cart item exceeds the available quantity
            if (cartQuantity > availableQuantity) {
                cartHasExceededQuantity = true;
                console.log(`Item in cart exceeds available quantity: ${item.ProductId.name}`);

                // Update the cart to set the quantity to the maximum available stock
                await User.updateOne(
                    { _id: req.session.user_id, 'cart.cartItems.ProductId': item.ProductId._id },
                    {
                        $set: {
                            'cart.cartItems.$.quantity': availableQuantity,
                            'cart.cartItems.$.total': availableQuantity * item.ProductId.price
                        }
                    }
                );
                updatedCart = true;
            }
        }

        // If the cart was updated due to quantity changes, set a session message
        if (updatedCart) {
            req.session.mType = 'info';
            req.session.mContent = 'Cart Product stock updated, so your cart quantity has been changed to the maximum available purchase quantity.';
            return res.redirect('/cart');
        }
        next();

    } catch (error) {
        console.error('Error in checkCartQuantities middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkCartQuantities;
