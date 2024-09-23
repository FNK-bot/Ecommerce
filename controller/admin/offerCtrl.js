const Order = require('../../models/order');
const ProductModel = require('../../models/product')
const Category = require('../../models/catagory');
const Brand = require('../../models/brand');
const mongoose = require('mongoose');


const manageOffers = async (req, res) => {
    try {
        console.log('offer api')
        console.log(req.body)
        let { input, type, id } = req.body;
        input = parseInt(input)

        if (type == 'product') {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                id = new mongoose.Types.ObjectId(id);
            }
            console.log('in products')
            let product = await ProductModel.findById(id);
            if (product.price >= input && input >= 0) {
                product.offer.status = true;
                product.offer.amount = input;
                if (!product.actualPrice.set) {
                    product.actualPrice.set = true
                    product.actualPrice.amount = product.price;
                }
                product.price = input
                await product.save()
                let result = await ProductModel.findById(id);
                console.log(result)
                res.json({ isConfirmed: true })
            } else {
                res.json({ validationError: true, isConfirmed: false })
            }
        }


        if (type == 'catagory') {
            console.log('catogary')
            if (input <= 100 && input >= 0) {
                let catagory = await Category.findById(id);
                console.log(catagory)
                console.log(typeof id)
                catagory.offer.status = true;
                catagory.offer.percentage = input;
                await catagory.save()
                let catagoryCh = await Category.findById(id);
                console.log('catogary chnaged ', catagory._id)
                let allProductsOfCatagory = await ProductModel.find({ categary: id });
                console.log(allProductsOfCatagory)
                for (let product of allProductsOfCatagory) {
                    //offer for all products -- offer calculated by percentage
                    product.price = product.price - Math.floor(product.price * (input / 100))
                    await product.save()
                    let chnaged = await ProductModel.findOne({ _id: product._id });
                    console.log('chnaged price', chnaged.price)
                }

                res.json({ isConfirmed: true })
            } else {
                res.json({ validationError: true, isConfirmed: false })
            }
        }

    } catch (error) {
        console.log(`Error in Offer api`, error);
    }
}


const deleteOffer = async (req, res) => {
    try {
        console.log('delerte offer api')
        console.log(req.query)
        let id = req.query.id
        let type = req.query.type || 'product';
        if (type == 'product') {
            id = new mongoose.Types.ObjectId(id)
            let product = await ProductModel.findById(id);

            product.offer.status = false;
            product.offer.amount = 0;
            product.price = product.actualPrice.amount
            await product.save()
            let result = await ProductModel.findById(id);
            console.log(result)
            res.redirect('products')

        }
        if (type == 'catagory') {

            let catagory = await Category.findById(id);
            console.log(catagory)
            console.log(typeof id)
            catagory.offer.status = false;
            let input = catagory.offer.percentage
            catagory.offer.percentage = 0;
            await catagory.save()
            let catagoryCh = await Category.findById(id);
            console.log('catogary chnaged ', catagoryCh)
            let allProductsOfCatagory = await ProductModel.find({ categary: id });
            console.log(allProductsOfCatagory)
            for (let product of allProductsOfCatagory) {
                //offer for all products -- offer calculated by percentage
                product.price = product.price + Math.floor(product.price * (input / 100))
                await product.save()
                let chnaged = await ProductModel.findOne({ _id: product._id });
                console.log('chnaged price', chnaged.price)
            }

            res.redirect('back');
        }


    } catch (error) {
        console.log(`Error in Delete Offer api`, error);
    }
}


module.exports = { manageOffers, deleteOffer }