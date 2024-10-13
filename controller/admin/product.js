const Catagory = require('../../models/catagory');
const Product = require('../../models/product')
const Brand = require('../../models/brand');
const { isValidObjectId } = require('mongoose');

//get all Products 
const getAllProduct = async (req, res) => {
    try {
        //fetch All products
        const allProducts = await Product.find({ isDeleted: false })

        //Pagination Logic
        const itemsperpage = 5;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allProducts.length / 5);
        const currentproduct = allProducts.slice(startindex, endindex);

        //configure alert Message for Better User experience
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/products', {
            product: currentproduct, totalpages, currentpage,
            message: '', alertMessage
        })
    } catch (error) {
        console.error('error in products ', error)
        res.status(500).json({ message: "Internal server Error" })
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
        console.error('error in add products ' + error);
        res.status(500).json({ message: "Internal server Error" });
    }
}


const postAddProduct = async (req, res) => {
    try {
        //handle if Images is less than 2 
        if (req.files.length < 2) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Atleast Two images required'
            };
            return res.redirect('/admin/addProduct');
        }

        const checkProductExist = await Product.findOne({ name: req.body.name });
        //product exist with same name
        if (checkProductExist) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Product already Exist with Name'
            };
            return res.redirect('/admin/addProduct');


        } else {
            const images = [];

            //add all images to image array
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
                console.log(req.files[i].filename)
            }

            //create new product
            let newProduct = new Product({
                name: req.body.name,
                discription: req.body.discription,
                brand: req.body.brand,
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

            await newProduct.save()

            req.session.alertMessage = {
                type: 'success',
                message: 'New Product added'
            };
            return res.redirect('/admin/addProduct');

        }

    } catch (error) {
        console.error('Error in postAddProduct: ', error);

        req.session.alertMessage = {
            type: 'error',
            message: 'some thing went wrong'
        };
        res.redirect('/admin/products');
    }
};

//validate product and id
const validateProduct = async (req, res, id) => {

    if (!isValidObjectId(id)) {
        req.session.alertMessage = {
            type: 'error',
            message: 'Product not valid'
        };
        return res.redirect('/admin/products');
    }

    //fetch Product
    let findProduct = await Product.findOne({ _id: id, isDeleted: false })

    if (!id || !isValidObjectId(id) || !findProduct) {
        req.session.alertMessage = {
            type: 'error',
            message: 'Product not valid'
        };
        return res.redirect('/admin/products');
    }

    //else
    return true;
}

//edit product
const getEditProduct = async (req, res) => {
    try {

        const id = req.query.id || false;

        //calling validation function
        if (! await validateProduct(req, res, id)) {
            return
        }

        let editProduct = await Product.findById(id).populate('categary', 'name').populate('brand', 'name');

        const getAllCatagory = await Catagory.find({ isDeleted: false });

        const brands = await Brand.find({ isDeleted: false })

        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/editProduct', { product: editProduct, category: getAllCatagory, alertMessage, brands })

    } catch (error) {
        console.error('error in edit products', error)

        req.session.alertMessage = {
            type: 'error',
            message: 'some thing went wrong'
        };
        res.redirect('/admin/products');
    }
}


const postEditProduct = async (req, res) => {
    try {

        const id = req.params.id;

        //calling validation function
        if (! await validateProduct(req, res, id)) {
            return
        }

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

        await Product.findByIdAndUpdate(id, updateData, { new: true });

        req.session.alertMessage = {
            type: 'success',
            message: 'Product Updated'
        };
        res.redirect('/admin/products');

    } catch (error) {
        console.error('Error in editing products: ', error);

        req.session.alertMessage = {
            type: 'error',
            message: 'some thing went wrong'
        };
        res.redirect('/admin/products');
    }
};


// manage delete product image api
const deleteImage = async (req, res) => {
    try {

        let { productId, imageName } = req.body;
        let findProduct = await Product.findById(productId);

        if (findProduct) {

            if (findProduct.images.length == 2) {

                return res.status(201).json({
                    message: `Minimum Two images needed if  you need to change image
                     upload image you want and try to delete after` });
            }

            await Product.updateOne(
                { _id: productId },
                { $pull: { images: imageName } }
            )

            return res.status(200).json({ message: 'success' })
        } else {

            res.status(400).json({ error: 'Product Not Found' });
        }
    } catch (error) {

        console.error("Error in Delete product image api ", error)
        res.status(500).json({ error: 'Internal server error' });
    }
}

// manage newly addeed product image api
const addImage = async (req, res) => {
    try {
        let { productId } = req.body;


        let imageName = req.file.filename

        await Product.updateOne(
            { _id: productId },
            { $push: { images: imageName } }
        )

        res.status(200).json({ imageName });
    } catch (error) {

        console.error("Error in add  product image api ", error)
        res.status(500).json({ error: 'Internal server error' });
    }
}


// delete Product
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;

        // Update product 
        const product = await Product.findOneAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } },
            { new: true }
        );

        // Check if the product was found and updated
        if (!product) {
            return res.status(400).json({ error: 'Product Not found' })
        }

        return res.status(200).json({ message: 'success' })
    } catch (err) {
        console.error('Error in delete product', err);
        return res.status(500).json({ error: 'Interal Server error' })
    }
};

module.exports = {
    getAllProduct, postEditProduct,
    getAddProduct, getEditProduct, postAddProduct, deleteProduct, deleteImage, addImage
};
