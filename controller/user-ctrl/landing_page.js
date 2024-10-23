const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const Brand = require('../../models/brand')
const { query, validationResult } = require('express-validator');

const getLanding = async (req, res) => {
    try {
        const user = req.session.user_id || null;

        //fetch 3 Category Data 
        const catagory = await Catagory.find({ isDeleted: false }).limit(3)

        //fetch 6 Products Data and Populating the 
        const product = await Product.find({ isDeleted: false }).limit(6)
            .populate({ path: 'brand', select: 'name', strictPopulate: false })

        //fetch 10 Brands Data that are not deleted 
        const brand = await Brand.find({ isDeleted: false }).limit(10);
        req.session.Product = product;

        // Check whether user is there and assign on logic
        const userData = user ? await User.findById(user) : null;

        // render the index page with Required Data 
        return res.render("user-views/index", { user: userData, product, catagory, brand });


    } catch (error) {
        console.error('error in getLanding error:', error)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

// serverside serching api
const search = async (req, res) => {

    // Validate and sanitize the query
    await query('query')
        .trim() // Remove whitespace from both ends
        .isString().withMessage('Query must be a string')
        .isLength({ min: 1 }).withMessage('Query cannot be empty')
        .escape()(req, res, (err) => {
            if (err) {
                return res.status(400).json({ errors: [{ msg: err.msg }] });
            }
        });

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        //assigning after sanitisazion and Validation
        let query = req.query.query

        //fetching Product with query
        const products = await Product.find({ name: new RegExp(query, 'i'), isDeleted: false });

        //return response
        return res.status(200).json({ message: 'sucessfully fetched', products })

    } catch (err) {
        console.error('Error in seaching product Err', err)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

module.exports = { getLanding, search }