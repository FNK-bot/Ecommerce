const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const isLogged =require('../middleware/authUser')
const passport = require('passport');
const upload = require('../multer/multer')

const getLanding = require('../controller/user controller/landing_page')

const getShoping = require('../controller/user controller/shop_controller')

const getSingleProduct  = require('../controller/user controller/single_product');

const { getOtpPage,getLogin, getRegister,getForgotPassword,postRegister,
     postOtp, postLogin,getLogOut,googleAuth,getResetPassword,postResetPassword,
     postForgotPassword} = require('../controller/user controller/userAuthCtrl');

const {getProfile,getEditAdress,getEditProfile, getAddAdress, postAddAddress,
      getDeleteAddress, postEditProfile, postEditAdress,
      getChangePassword,
      postChangePassword} = require('../controller/user controller/profileCtrl');

const {getCart,postAddtoCart,putIncrementQnt,putDecrementQnt,deleteCartItem,
     getCheckOut,postChekOut ,deleteOrder} = require('../controller/user controller/cartCtrl');


// get landing page
router.get('/',getLanding)
// get shopping page
router.get('/shop',getShoping)

// User Authentication rout
router.get('/login',getLogin);
router.post('/login',postLogin);
router.get('/logout',getLogOut);
router.get('/register',getRegister);
router.post('/register',postRegister);
router.get('/otp',getOtpPage);
router.post('/otp',postOtp);
router.get('/forgotPassword',getForgotPassword);
router.post('/forgotPassword',postForgotPassword);
router.get('/resetPassword',getResetPassword)
router.post('/resetPassword',postResetPassword)

// directing to google api
router.get('/google',passport.authenticate('google',{scope:['profile','email']}));
//  handle callback from Google
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/register' }),googleAuth);
// get single product page
router.get('/product',isLogged,getSingleProduct)

// User profile
router.get('/profile',isLogged,getProfile)
router.get('/add-new-address',isLogged,getAddAdress)
router.post('/add-new-address',isLogged,postAddAddress)
router.get('/deleteAddress',isLogged,getDeleteAddress)
router.get('/editAddress',isLogged,getEditAdress)
router.post('/editAddress',isLogged,postEditAdress)
router.get('/edit-profile',isLogged,getEditProfile)
router.post('/edit-profile',isLogged,upload.single('image'),postEditProfile)
router.get('/changepass',isLogged,getChangePassword) 
router.post('/changepass',isLogged,postChangePassword) 

//Cart
router.get('/cart',isLogged,getCart)
router.post('/addToCart',isLogged,postAddtoCart);
router.post('/addToCart',isLogged,postAddtoCart);
router.put('/incrementQnt',isLogged,putIncrementQnt);
router.put('/decrementQnt',isLogged,putDecrementQnt);
router.get('/deleteCartItem',isLogged,deleteCartItem)


//checkOut
router.get('/checkOut',isLogged,getCheckOut)
router.post('/checkOut',isLogged,postChekOut)

//order
router.get('/deleteOrder',isLogged,deleteOrder)

module.exports = router;
