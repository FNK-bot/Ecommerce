const Catagory = require('../../models/catagory');
const Product = require('../../models/product')
const Brand = require('../../models/brand')
const mongoose = require('mongoose');
const { image } = require('pdfkit');
//get all Producsts 
const getAllProduct = async (req, res) => {
    try {
        const allProducts = await Product.find({ isDeleted: false })
        const itemsperpage = 5;
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
        // let message = '';
        console.log('req.files ', req.files);

        const checkProductExist = await Product.findOne({ name: req.body.name });
        console.log('check product exist', checkProductExist);

        if (req.files.length < 2) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Atleast Two images required'
            };
            return res.redirect('/admin/addProduct');
        }

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

            let newProduct = new Product({
                name: req.body.name,
                discription: req.body.discription,
                brand: req.body.brand,
                // offerPrice: req.body.offerPrice,
                price: req.body.price,
                categary: req.body.category,
                quantity: req.body.quantity,
                size: req.body.size,
                color: req.body.color,
                images: images,
            });
            //offer manage
            newProduct.actualPrice.set = true
            newProduct.actualPrice.amount = req.body.price;

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
        const id = req.query.id;
        console.log(id)
        // Check if the provided id is a valid MongoDB ObjectId
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     throw new Error("Invalid product ID");
        // }

        let editProduct = await Product.findById(id).populate('categary', 'name').populate('brand', 'name');
        console.log(editProduct)
        if (!editProduct) {
            throw new Error("Product not found");
        }
        // let editProduct = await Product.findById(id);
        const getAllCatagory = await Catagory.find({ isDeleted: false });
        const brands = await Brand.find({ isDeleted: false })
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/editProduct', { product: editProduct, category: getAllCatagory, alertMessage, brands })
        console.log('ends')
    } catch (error) {
        console.log('error in edit products', error)
    }
}


const postEditProduct = async (req, res) => {
    try {
        console.log('Post edit product control', req.body, req.files);
        const id = req.params.id;


        const updateData = {
            name: req.body.name,
            discription: req.body.discription,
            brand: req.body.brand,
            price: req.body.price,
            categary: req.body.category,
            quantity: req.body.quantity,
            size: req.body.size,
            color: req.body.color,
        };

        //offer manage
        let product = await Product.findById(id)
        product.actualPrice.set = true
        product.actualPrice.amount = req.body.price;
        product.offer.status = false;
        product.save()

        let editProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        req.session.alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Product Updated'
        };
        res.redirect('/admin/products');
    } catch (error) {
        console.log('Error in editing products: ' + error);
    }
};


// manage delete product image api

const deleteImage = async (req, res) => {
    try {

        let { productId, imageName } = req.body;
        let findProduct = await Product.findById(productId);
        if (findProduct) {
            if (findProduct && findProduct.images.length == 2) {

                console.log('erroro images 2 ')
                return res.status(201).json({ message: 'Minimum Two images needed if  you need to change image upload image you want and try to delete after' });
            }
            await Product.updateOne(
                { _id: productId },
                { $pull: { images: imageName } }
            )
            console.log('changed image')
            return res.status(200).json({ message: 'success' })
        } else {
            console.log('product not found', productId)
        }
    } catch (error) {
        console.log("Error in Delete product image api ", error)
        res.status(500).json({ error: 'Internal server error' });
    }
}

// manage newly addeed product image api
const addImage = async (req, res) => {
    try {
        let { productId } = req.body;
        console.log(req.body)
        console.log(req.file)
        let imageName = req.file.filename
        console.log(imageName)
        await Product.updateOne(
            { _id: productId },
            { $push: { images: imageName } }
        )
        res.status(200).json({ imageName })
    } catch (error) {
        console.log("Error in add  product image api ", error)
        res.status(500).json({ error: 'Internal server error' });
    }
}


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
    getAddProduct, getEditProduct, postAddProduct, deleteProduct, deleteImage, addImage
};
