const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const Brand = require('../../models/brand')

const getShop = async (req, res) => {
    try {
        let sort = req.query.sort || '';
        let catagory_id = req.query.id || false;
        let sortSetting = {};
        let filterCatagory = catagory_id ? { categary: catagory_id } : {};
        switch (sort) {
            case 'price-asc':
                sortSetting.price = 1;
                break;
            case 'price-desc':
                sortSetting.price = -1;
                break;
            case 'name-asc':
                sortSetting.name = 1;
                break;
            case 'name-desc':
                sortSetting.name = -1;
                break;
            default:
                sortSetting = {};
        }

        const allProduct = await Product.find(filterCatagory).collation({ locale: 'en', strength: 2 }).sort(sortSetting);
        let product = allProduct.filter((product) => product.isDeleted === false)
        const catagory = await Catagory.find({ isDeleted: { $ne: true } })
        const user = await User.findById(req.session.user_id)
        const brand_ids = product.map((item) => item.brand);
        const brand = await Brand.find({ _id: { $in: brand_ids } });

        let totalProducts = product.length;
        const itemsperpage = totalProducts > 9 ? 9 : totalProducts;
        console.log('item per page' + itemsperpage)
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(totalProducts / 9);
        let currentproduct = product.slice(startindex, endindex);
        res.render("user-views/shop", { user, product: currentproduct, catagory, totalpages, currentpage, totalProducts, brand });

    } catch (error) {

        console.log('error in getShop error:', error)
    }
};

module.exports = getShop