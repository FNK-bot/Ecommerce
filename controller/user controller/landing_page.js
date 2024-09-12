const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const Brand = require('../../models/brand')

const getLanding = async (req, res) => {
    try {
        const user = req.session.user_id;
        const catagory = await Catagory.find({ isDeleted: false }).limit(3)
        const product = await Product.find({ isDeleted: false }).limit(6);
        const brand_ids = product.map((item) => item.brand);
        const brand = await Brand.find({ _id: { $in: brand_ids } });
        console.log('brand', brand)
        req.session.Product = product;
        if (user) {
            const userdata = await User.findById(user)
            res.render("user-views/index", { user: userdata, product, catagory, brand });

        } else {
            res.render("user-views/index", { user: null, product, catagory, brand });
        }
    } catch (error) {

        console.log('error in getLanding error:', error)
    }
}

// serverside serching
const search = async (req, res) => {
    try {
        let query = req.query.query
        Product.find({ name: new RegExp(query, 'i') }).then((matchedProducts) => {
            let products = matchedProducts.filter((product) => product.isDeleted === false)
            console.log(products)
            res.json(products)
        }).catch((err) => {
            res.status(500).json({ error: 'some thing gone wrong' })
        })
    } catch (err) {
        console.log('Error in seaching product Err', err)
        res.status(500).json({ err: 'error in server' })
    }
}
module.exports = { getLanding, search }