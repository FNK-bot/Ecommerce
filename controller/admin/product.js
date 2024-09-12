const Catagory = require('../../models/catagory');
const Product = require('../../models/product')
const Brand = require('../../models/brand')

//get all Producsts 
const getAllProduct = async (req, res) => {
    try {
        const allProducts = await Product.find({ isDeleted: false })
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allProducts.length / 5);
        const currentproduct = allProducts.slice(startindex, endindex);
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/products', {
            product: currentproduct, totalpages, currentpage,
            message: '', alertMessage
        })
    } catch (error) {
        console.log('error in products ', error)
    }
}

//add product

const getAddProduct = async (req, res) => {
    try {
        const allProducts = await Product.find({ isDeleted: false });
        const getAllCatagory = await Catagory.find({ isDeleted: false });
        const brands = await Brand.find({ isDeleted: false });
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/addProduct', { product: allProducts, category: getAllCatagory, message: '', alertMessage, brands })
    } catch (error) {
        console.log('error in add products ' + error)
    }
}


const postAddProduct = async (req, res) => {
    try {
        console.log('body ', req.body);
        let message = '';
        console.log('req.files ', req.files);

        const checkProductExist = await Product.findOne({ name: req.body.name });
        console.log('check product exist', checkProductExist);

        if (checkProductExist) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Product already Exist with Name'
            };
            return res.redirect('/admin/addProduct');
        } else {
            const images = [];

            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                    console.log(req.files[i].filename)
                }
            }

            const newProduct = new Product({
                name: req.body.name,
                discription: req.body.discription,
                brand: req.body.brand,
                offerPrice: req.body.offerPrice,
                price: req.body.price,
                categary: req.body.category,
                quantity: req.body.quantity,
                size: req.body.size,
                color: req.body.color,
                images: images,
            });

            if (await newProduct.save()) {
                console.log('Product added successfully');
                req.session.alertMessage = {
                    type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                    message: 'Product added'
                };
                return res.redirect('/admin/addProduct');
            } else {
                req.session.alertMessage = {
                    type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                    message: 'Check all fields'
                };
                console.log('Error while saving the product');
            }
        }

    } catch (error) {
        console.log('Error in postAddProduct: ', error);
        req.session.alertMessage = {
            type: 'error', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Check all fields'
        };
        res.redirect('/admin/addProduct');
    }
};


//edit product

const getEditProduct = async (req, res) => {
    try {
        res.status(200)
        console.log('Get edit product control')
        const id = req.params.id;
        let editProduct = await Product.findById(id);
        const getAllCatagory = await Catagory.find({ isDeleted: false });
        const brands = await Brand.find({ isDeleted: false })
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/editProduct', { product: editProduct, category: getAllCatagory, alertMessage, brands })
    } catch (error) {
        console.log('error in edit products', error)
    }
}


const postEditProduct = async (req, res) => {
    try {
        console.log('Post edit product control', req.body);
        const id = req.params.id;
        let images = [];
        let editProduct;

        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
                console.log(req.files[i].filename)
            }
        } else {
            images = null;
        }

        const updateData = {
            name: req.body.name,
            discription: req.body.discription,
            brand: req.body.brand,
            offerPrice: req.body.offerPrice,
            price: req.body.price,
            categary: req.body.categary,
            quantity: req.body.quantity,
            size: req.body.size,
            color: req.body.color,
        };

        if (images) {
            updateData.images = images;
        }

        editProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        req.session.alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Product Updated'
        };
        res.redirect('/admin/products');
    } catch (error) {
        console.log('Error in editing products: ' + error);
    }
};


// delete

const deleteProduct = async (req, res) => {
    try {
        console.log('delete product control')
        const id = req.params.id;
        await Product.findOneAndUpdate({ _id: id }, {
            $set: {
                isDeleted: true
            }
        }).then(() => {
            req.session.alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Product deleted'
            };

            res.redirect('/admin/products');
        })
    }
    catch (err) {
        console.log('error in delete product', err)
    }
}
module.exports = {
    getAllProduct, postEditProduct,
    getAddProduct, getEditProduct, postAddProduct, deleteProduct
};
