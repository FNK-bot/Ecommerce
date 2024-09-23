var express = require('express');
var router = express.Router();
const upload = require('../multer/multer.js')
const { getDashboard, getSalesReportApi, getSalesReportPage } = require('../controller/admin/dashbaord');
const { getAllUsers, blockUser, unBlockUser } = require('../controller/admin/users.js');
const { getAllProduct, getAddProduct, postAddProduct, getEditProduct, postEditProduct, deleteProduct } = require('../controller/admin/product');
const { getAllCatagory, getAddCatagory, getEditCatagory, postAddCatagory, postEditCatagory, deleteCatagory } = require('../controller/admin/catagory');
const { getlogIn, postLogin, logout } = require('../controller/admin/login_out');
const isLogged = require('../middleware/authAdmin.js');
const { getOrders, shippOrder, unShippOrder, deleteOrder, getOrderDetails, deleverOneItem } = require('../controller/admin/ordersCntrl.js');
const { getBrands, getEditBrand, postEditBrand, getAddBrand, postAddBrand, deleteBrand } = require('../controller/admin/brandCtrl.js');
const { manageOffers, deleteOffer } = require('../controller/admin/offerCtrl.js');
//login
router.get('/login', getlogIn);
router.post('/login', postLogin);
router.get('/logout', logout)

// admin dashboard
router.get('/', isLogged, getDashboard)

//customers rout
router.get('/users', isLogged, getAllUsers); // get all users
router.get('/users/block/:id', isLogged, blockUser); // Block user
router.get('/users/unblock/:id', isLogged, unBlockUser); // Unblock user

//product rout
router.get('/products', isLogged, getAllProduct)
router.get('/addProduct', isLogged, getAddProduct)
router.post('/addProduct', upload.array('images', 12), isLogged, postAddProduct)
router.get('/editProduct', isLogged, getEditProduct)
router.post('/editProduct/:id', upload.array('images', 12), isLogged, postEditProduct); //edit product
router.get('/deleteProduct/:id', isLogged, deleteProduct)
//catagory
router.get('/catagorys', isLogged, getAllCatagory);//get all catagory
router.get('/addCatagory', isLogged, getAddCatagory);//get add catagory
router.post('/addCatagory', upload.single('images'), isLogged, postAddCatagory);//post add catagory
router.get('/editCatagory', isLogged, getEditCatagory);//get add catagory    
router.post('/editCatagory', upload.single('images'), postEditCatagory);//post add catagory    
router.get('/deleteCatagory', deleteCatagory)

//Brand
router.get('/brands', isLogged, getBrands);//get all Brand
router.get('/addBrand', isLogged, getAddBrand);//get add Brand
router.post('/addBrand', upload.single('images'), isLogged, postAddBrand);//post add Brand
router.get('/editBrand', isLogged, getEditBrand);//get add Brand    
router.post('/editBrand', upload.single('images'), postEditBrand);//post add Brand    
router.get('/deleteBrand', deleteBrand) //delete brand


// orders
router.get('/orders', isLogged, getOrders)
router.get('/shippOrder', isLogged, shippOrder)
router.get('/unShippOrder', isLogged, unShippOrder)
router.get('/deleteOrder', isLogged, deleteOrder)
//order Details
router.get('/orderDetails', isLogged, getOrderDetails)
router.get('/deleverOneItem', isLogged, deleverOneItem)

// sales report
router.get('/salesReport', isLogged, getSalesReportPage)
router.get('/api/sales-report', isLogged, getSalesReportApi)

//offer
router.post('/api/addOffer', isLogged, manageOffers)
router.get('/deleteOffer', isLogged, deleteOffer)
module.exports = router;
