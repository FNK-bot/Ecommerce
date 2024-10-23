const ProductModel = require('../../models/product');
const Category = require('../../models/catagory');


const manageOffers = async (req, res) => {
    try {
        let { input, type, id } = req.body;
        input = parseInt(input)

        //If request From Product Offer
        if (type == 'product') {

            let product = await ProductModel.findById(id);
            if (!product) {
                return res.status(404).json({ error: 'Product Not Found' })
            }

            //validate product Price is greater than input and input greter than zero 
            if (product.price >= input && input >= 0) {
                product.offer.status = true;
                product.offer.amount = input;

                // Ensure the actual price is set only the first time
                if (!product.actualPrice.set) {
                    product.actualPrice.set = true
                    product.actualPrice.amount = product.price;
                }

                product.price = input
                await product.save()

                res.status(200).json({ isConfirmed: true })
            } else {
                res.status(400).json({ validationError: true, isConfirmed: false })
            }
        }

        // Category Offer Logic
        else if (type == 'catagory') {

            //check input in not greater than 100 and Lessthan 0
            if (input <= 100 && input > 0) {
                let catagory = await Category.findById(id);
                if (!catagory) {
                    return res.status(404).json({ error: 'Catagory Not Found' });
                };

                catagory.offer.status = true;
                catagory.offer.percentage = input;
                await catagory.save();

                let allProductsOfCatagory = await ProductModel.find({ categary: id });

                for (let product of allProductsOfCatagory) {
                    //setting offer for all products -- offer calculated by percentage
                    if (!product.actualPrice.set) {
                        product.actualPrice.amount = product.price;
                        product.actualPrice.set = true;
                    }
                    // Calculate the new price with the offer percentage
                    let newPrice = product.actualPrice.amount - Math.floor(product.actualPrice.amount * (input / 100));
                    product.price = Math.max(newPrice, 0); // Ensure price is not negative
                    await product.save();
                }

                res.status(200).json({ isConfirmed: true })
            } else {
                res.status(400).json({ validationError: true, isConfirmed: false })
            }
        }

    } catch (error) {
        console.error(`Error in Offer api`, error);
        res.status(500).json({ validationError: true, isConfirmed: false })
    }
}



const deleteOffer = async (req, res) => {
    try {

        let id = req.query.id;
        let type = req.query.type;

        if (type == 'product') {
            let product = await ProductModel.findById(id);
            if (!product) {
                return res.status(404).json({ error: 'Product Not Found' });
            }

            product.offer.status = false;
            product.offer.amount = 0;
            product.price = product.actualPrice.amount
            await product.save()

            res.status(200).json({ message: "success" });

        }
        else if (type == 'catagory') {

            let catagory = await Category.findById(id);
            if (!catagory) {
                return res.status(404).json({ error: 'Category Not Found' });
            }

            catagory.offer.status = false;
            let input = catagory.offer.percentage
            catagory.offer.percentage = 0;
            await catagory.save()


            let allProductsOfCatagory = await ProductModel.find({ categary: id });

            for (let product of allProductsOfCatagory) {

                let restoredPrice = product.actualPrice.amount;
                product.price = Math.max(restoredPrice, 0); // Ensure price is not negative
                await product.save();

            }

            res.status(200).json({ message: 'success' });
        }
        else {
            res.status(400).json({ error: 'Not valid Request' });
        }

    } catch (error) {
        console.error(`Error in Delete Offer api`, error);
        res.status(500).json({ error: 'Internal Server error' });
    }
}


module.exports = { manageOffers, deleteOffer }