const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const isLogged = require('../middleware/authUser')
const passport = require('passport');
const upload = require('../multer/multer')

const { getLanding, search } = require('../controller/user controller/landing_page')

const getShoping = require('../controller/user controller/shop_controller')

const getSingleProduct = require('../controller/user controller/single_product');

const { getOtpPage, getLogin, getRegister, getForgotPassword, postRegister,
     postOtp, postLogin, getLogOut, googleAuth, getResetPassword, postResetPassword,
     postForgotPassword, resendOtp } = require('../controller/user controller/userAuthCtrl');

const { getProfile, getEditAdress, getEditProfile, getAddAdress, postAddAddress,
     deleteAddress, postEditProfile, postEditAdress,
     getChangePassword,
     postChangePassword,
     cancelOneItem, returnOneItem,
} = require('../controller/user controller/profileCtrl');

const { getCart, postAddtoCart, putIncrementQnt, putDecrementQnt, deleteCartItem,
     getCheckOut, postChekOut,
     getOrderSuccess,
     getCoupens,
     applyCoupen,
     cancelCoupen,
     invoice,
     payOnOderPage } = require('../controller/user controller/cartCtrl');

const { getWishlist, addToWishlist, deleteWishlist } = require('../controller/user controller/wishlistCtrl');


// get landing page
router.get('/', getLanding)
// get shopping page
router.get('/shop', getShoping)

// User Authentication rout
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/logout', getLogOut);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/otp', getOtpPage);
router.post('/otp', postOtp);
router.post('/resendOtp', resendOtp)
router.get('/forgotPassword', getForgotPassword);
router.post('/forgotPassword', postForgotPassword);
router.get('/resetPassword', getResetPassword)
router.post('/resetPassword', postResetPassword)

// directing to google api
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
//  handle callback from Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register' }), googleAuth);
// get single product page
router.get('/product', isLogged, getSingleProduct)

// User profile
router.get('/profile', isLogged, getProfile)
router.get('/add-new-address', isLogged, getAddAdress)
router.post('/add-new-address', isLogged, postAddAddress)
router.delete('/deleteAddress', isLogged, deleteAddress)
router.get('/editAddress', isLogged, getEditAdress)
router.post('/editAddress', isLogged, postEditAdress)
router.get('/edit-profile', isLogged, getEditProfile)
router.post('/edit-profile', isLogged, upload.single('image'), postEditProfile)
router.get('/changepass', isLogged, getChangePassword)
router.post('/changepass', isLogged, postChangePassword)

//Cart
router.get('/cart', isLogged, getCart)
router.post('/addToCart', isLogged, postAddtoCart);
router.put('/incrementQnt', isLogged, putIncrementQnt);
router.put('/decrementQnt', isLogged, putDecrementQnt);
router.delete('/deleteCartItem', isLogged, deleteCartItem)


//checkOut
router.get('/checkOut', isLogged, getCheckOut)
router.post('/checkOut', isLogged, postChekOut)

//order in profile
router.get('/orderSuccess', isLogged, getOrderSuccess)
router.post('/failedPayment', isLogged, payOnOderPage)
router.delete('/cancelOneItem', isLogged, cancelOneItem)
router.post('/returnOneItem', isLogged, returnOneItem)

//coupens
router.get('/mycoupens', isLogged, getCoupens)
router.put('/apply-coupen', isLogged, applyCoupen);
router.put('/cancel-coupen', isLogged, cancelCoupen);

//wishlist
router.get('/wishlist', isLogged, getWishlist)
router.get('/addToWishlist', isLogged, addToWishlist)
router.delete('/deleteWishlistItem', isLogged, deleteWishlist)

//search 
router.get('/search', search)

//invoice api
router.get('/downloadInvoice', isLogged, invoice)

module.exports = router;
