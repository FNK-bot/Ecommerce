const Product = require('../../models/product');
const Catagory = require('../../models/catagory');
const User = require('../../models/user');
const Brand = require('../../models/brand');
const { isValidObjectId } = require('mongoose');

const getShop = async (req, res) => {
    try {

        let sort = req.query.sort || '';
        let catagory_id = req.query.id || false;

        // check the catagory id is valid 
        if (catagory_id && !isValidObjectId(catagory_id)) {
            return res.status(400).json({ message: 'catagory not found' })
        };

        // check catagory id is there and the logic
        let filterCatagory = catagory_id ? { isDeleted: false, categary: catagory_id } : { isDeleted: false, };

        let sortSetting = {};
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

        //Fetch All products Data which is not deleted and sort and match catagory
        const allProduct = await Product.find(filterCatagory).collation({ locale: 'en', strength: 2 }).sort(sortSetting)
            .populate('categary').populate({ path: 'brand', select: 'name', strictPopulate: false })

        //fetch Catagory
        const catagory = await Catagory.find({ isDeleted: false });

        //fetch user data
        const user = await User.findById(req.session.user_id)

        //Assign catagory name and assign the catgoryName if catagory id  
        let categoryName;
        if (catagory_id) {
            categoryName = await Catagory.findById(catagory_id)
        }
        //Determine active catogory if the catagory name is there
        let active = catagory_id ? categoryName.name : 'All Items';

        //Pagination logic
        let totalProducts = allProduct.length;
        const itemsperpage = totalProducts > 9 ? 9 : totalProducts;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(totalProducts / 9);
        let currentproduct = allProduct.slice(startindex, endindex);

        //return respose with data
        return res.render("user-views/shop", {
            user, product: currentproduct, catagory,
            totalpages, currentpage, totalProducts, active
        });

    } catch (error) {
        console.error('error in getShop error:', error)
        res.status(500).json({ message: "Internal Server Error" })
    }
};
module.exports = getShop