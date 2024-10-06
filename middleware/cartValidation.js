const User = require('../models/user'); // Adjust the path as per your project structure
const Product = require('../models/product'); // Adjust the path as per your project structure

const checkCartQuantities = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.user_id).populate('cart.cartItems.ProductId');
        if (!user || user.cart.cartItems.length === 0) {
            return res.redirect('/cart'); // If user not found or cart is empty, redirect to cart page
        }

        let cartHasExceededQuantity = false;
        let updatedCart = false;

        // Iterate through the cart items and check quantities
        for (let item of user.cart.cartItems) {
            if (!item.ProductId) {
                return res.redirect('/cart'); // If product is not found for any cart item, redirect to cart
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
                            'cart.cartItems.$.quantity': availableQuantity, // Set cart quantity to the available quantity
                            'cart.cartItems.$.total': availableQuantity * item.ProductId.price // Update total price for the item
                        }
                    }
                );
                updatedCart = true; // Flag that cart has been updated
            }
        }

        // If the cart was updated due to quantity changes, set a session message
        if (updatedCart) {
            req.session.mType = 'info'; // Message type (can be displayed on the front end)
            req.session.mContent = 'Cart Product stock updated, so your cart quantity has been changed to the maximum available purchase quantity.';
            return res.redirect('/cart'); // Redirect back to the cart page after updating quantities
        }

        // If all quantities are valid, proceed to the next middleware or route handler
        next();

    } catch (error) {
        console.error('Error in checkCartQuantities middleware:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkCartQuantities;