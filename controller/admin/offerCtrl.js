const Order = require('../../models/order');
const Product = require('../../models/product')
const Category = require('../../models/catagory');
const Brand = require('../../models/brand');
const mongoose = require('mongoose');


const manageOffers = async (req, res) => {
    try {
        console.log('offer api')
        console.log(req.body)
        let { input, type, id } = req.body
        id = new mongoose.Types.ObjectId(id)
        if (type == 'product') {
            let model = await Product.findById(id);
            model.offer.status = true;
            model.offer.amount = input;
            model.save()
            let result = await Product.findById(id);
            console.log(result)
            res.json({ isConfirmed: true })
        }
        if (type == 'catagory') {
            let model = await Category.findById(id);
            model.offer.status = true;
            model.offer.amount = input;
            model.save()
            let result = await Category.findById(id);
            console.log(result)
            res.json({ isConfirmed: true })
        }
        if (type == 'brand') {
            let model = await Brand.findById(id);
            model.offer.status = true;
            model.offer.amount = input;
            model.save()
            let result = await Brand.findById(id);
            console.log(result)
            res.json({ isConfirmed: true })
        }

    } catch (error) {
        console.log(`Error in Offer api`, error);
    }
}


module.exports = manageOffers