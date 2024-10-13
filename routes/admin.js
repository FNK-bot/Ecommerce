let express = require('express');
let router = express.Router();
const upload = require('../multer/multer.js')
const { getDashboard, getSalesReportApi, getSalesReportPage } = require('../controller/admin/dashbaord');
const { getAllUsers, blockUser, unBlockUser } = require('../controller/admin/users.js');
const { getAllProduct, getAddProduct, postAddProduct, getEditProduct, postEditProduct, deleteProduct, deleteImage, addImage } = require('../controller/admin/product');
const { getAllCatagory, getAddCatagory, getEditCatagory, postAddCatagory, postEditCatagory, deleteCatagory } = require('../controller/admin/catagory');
const { getlogIn, postLogIn, logout } = require('../controller/admin/login_out');
const isLogged = require('../middleware/authAdmin.js');
const { getOrders, deleteOrder, getOrderDetails, deleverOneItem } = require('../controller/admin/ordersCntrl.js');
const { getBrands, getEditBrand, postEditBrand, getAddBrand, postAddBrand, deleteBrand } = require('../controller/admin/brandCtrl.js');
const { manageOffers, deleteOffer } = require('../controller/admin/offerCtrl.js');
const { getCoupens, getAddCoupen, postAddCoupen, deleteCoupen, getEditCoupen, postEditCoupen } = require('../controller/admin/coupenCtrl.js');

//auth
router.get('/login', getlogIn);
router.post('/login', postLogIn);
router.get('/logout', logout)

// admin dashboard
router.get('/', isLogged, getDashboard)

//customers rout
router.get('/users', isLogged, getAllUsers); // get all users
router.put('/users/block/:id', isLogged, blockUser); // Block user
router.put('/users/unblock/:id', isLogged, unBlockUser); // Unblock user

//product rout
router.get('/products', isLogged, getAllProduct)
router.get('/addProduct', isLogged, getAddProduct)
router.post('/addProduct', upload.array('images', 12), isLogged, postAddProduct)
router.get('/editProduct', isLogged, getEditProduct)
router.post('/editProduct/:id', upload.array('images', 12), isLogged, postEditProduct); //edit product
router.put('/addImage', upload.single('image'), isLogged, addImage)
router.delete('/deleteProduct/:id', isLogged, deleteProduct)
router.delete('/deleteImage', isLogged, deleteImage)

//catagory
router.get('/catagorys', isLogged, getAllCatagory);//get all catagory
router.get('/addCatagory', isLogged, getAddCatagory);//get add catagory
router.post('/addCatagory', upload.single('images'), isLogged, postAddCatagory);//post add catagory
router.get('/editCatagory', isLogged, getEditCatagory);//get add catagory    
router.post('/editCatagory', upload.single('images'), postEditCatagory);//post add catagory    
router.delete('/deleteCatagory', deleteCatagory);


//Brand
router.get('/brands', isLogged, getBrands);//get all Brand
router.get('/addBrand', isLogged, getAddBrand);//get add Brand
router.post('/addBrand', upload.single('images'), isLogged, postAddBrand);//post add Brand
router.get('/editBrand', isLogged, getEditBrand);//get add Brand    
router.post('/editBrand', upload.single('images'), postEditBrand);//post add Brand    
router.delete('/deleteBrand', deleteBrand) //delete brand


// orders
router.get('/orders', isLogged, getOrders);
router.delete('/deleteOrder', isLogged, deleteOrder);

//order Details
router.get('/orderDetails', isLogged, getOrderDetails);
router.put('/deleverOneItem', isLogged, deleverOneItem);

// sales report(dashboard page)
router.get('/salesReport', isLogged, getSalesReportPage)
router.get('/api/sales-report', isLogged, getSalesReportApi)

//offer
router.post('/api/addOffer', isLogged, manageOffers)
router.delete('/deleteOffer', isLogged, deleteOffer)

//Coupens 
router.get('/coupens', isLogged, getCoupens)
router.get('/addCoupen', isLogged, getAddCoupen)
router.post('/addCoupen', isLogged, postAddCoupen)
router.get('/editCoupen', isLogged, getEditCoupen)
router.post('/editCoupen', isLogged, postEditCoupen)
router.delete('/deleteCoupen', isLogged, deleteCoupen)


module.exports = router;


