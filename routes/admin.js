var express = require('express');
var router = express.Router();
const upload = require('../multer/multer.js')
const getDashboard = require('../controller/admin/dashbaord');
const {getAllUsers,blockUser,unBlockUser} = require('../controller/admin/users.js');
const { getAllProduct, getAddProduct, postAddProduct, getEditProduct ,postEditProduct, deleteProduct} = require('../controller/admin/product');
const { getAllCatagory, getAddCatagory, getEditCatagory, postAddCatagory, postEditCatagory, deleteCatagory } = require('../controller/admin/catagory');
const {getlogIn,postLogin,logout} = require('../controller/admin/login_out');
const isLogged = require('../middleware/authAdmin.js');
const  {getOrders,shippOrder,unShippOrder,deleteOrder} = require('../controller/admin/ordersCntrl.js');
//login
router.get('/login',getlogIn);
router.post('/login',postLogin);
router.get('/logout',logout)

// admin dashboard
router.get('/',isLogged,getDashboard)

//customers rout
router.get('/users',isLogged,getAllUsers); // get all users
router.get('/users/block/:id',isLogged,blockUser); // Block user
router.get('/users/unblock/:id',isLogged,unBlockUser); // Unblock user

//product rout
router.get('/products',isLogged,getAllProduct)
router.get('/addProduct',isLogged,getAddProduct)
router.post('/addProduct',upload.array('images',12),isLogged,postAddProduct)
router.get('/editProduct/:id',isLogged,getEditProduct) 
router.post('/editProduct/:id',upload.array('images',12),isLogged,postEditProduct); //edit product
router.get('/deleteProduct/:id',isLogged,deleteProduct)
//catagory
router.get('/catagorys',isLogged,getAllCatagory);//get all catagory
router.get('/addCatagory',isLogged,getAddCatagory);//get add catagory
router.post('/addCatagory',upload.single('images'),isLogged,postAddCatagory);//post add catagory
router.get('/editCatagory',isLogged,getEditCatagory);//get add catagory    
router.post('/editCatagory',upload.single('images'),postEditCatagory);//post add catagory    
router.get('/deleteCatagory',deleteCatagory)

// orders
router.get('/orders',isLogged,getOrders)
router.get('/shippOrder',isLogged,shippOrder)
router.get('/unShippOrder',isLogged,unShippOrder)
router.get('/deleteOrder',isLogged,deleteOrder)
module.exports = router;
