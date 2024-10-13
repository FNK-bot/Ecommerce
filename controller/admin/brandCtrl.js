const Brands = require('../../models/brand')

const getBrands = async (req, res) => {
    try {
        //fetch all Brands data
        const allBrands = await Brands.find({ isDeleted: false });

        //Pagination logic
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allBrands.length / 3);
        const currentproduct = allBrands.slice(startindex, endindex);

        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/allBrand', { brands: currentproduct, totalpages, currentpage, alertMessage });
    } catch (error) {
        console.error('error in get all Brands', error);
        res.status(500).json({ message: 'Internal server Error' });
    }
}


const getAddBrand = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/addBrand', { alertMessage })
    } catch (error) {
        console.error('error in get addBrand', error);
        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/brands')
    }
};

const postAddBrand = async (req, res) => {
    try {
        const { name, discription } = req.body;
        let image = req?.file;

        if (!name || !image) {
            req.session.alertMessage = {
                type: 'error',
                message: 'All Field is Required '
            };
            return res.redirect('/admin/addBrand')
        }

        if (!discription) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Description needed'
            };
            return res.redirect('/admin/addBrand')
        }

        const brandExist = await Brands.findOne({ name });
        if (brandExist) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Brand already exists'
            };
            return res.redirect('/admin/addBrand')
        }
        else {
            let image = null;
            if (req.file) {
                image = req.file.filename;
            }

            const newBrand = new Brands({
                name: name.toUpperCase(),
                discription,
                image,
            });

            await newBrand.save();
            req.session.alertMessage = {
                type: 'success',
                message: 'New Brand Added'
            };

            return res.redirect('/admin/addBrand')

        }


    } catch (error) {
        console.error('error in post addBrand ', error);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/brands');
    }
}


const getEditBrand = async (req, res) => {
    try {
        const id = req.query.id;

        const brandExist = await Brands.findById(id)
        if (!brandExist || brandExist.isDeleted) {
            req.session.alertMessage = {
                type: 'error',
                message: "brand not found"
            }
            return res.redirect('/admin/brands');
        }

        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null

        res.render('admin/editBrand', { brand: brandExist, alertMessage })
    } catch (error) {
        console.error('error in Get edit Brand');

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/brands')
    }
};

const postEditBrand = async (req, res) => {
    try {

        const id = req.query.id;

        const img = req.file ? req.file.filename : null; // Check if req.file is defined

        if (img) {
            await Brands.findByIdAndUpdate(id, {
                name: req.body.name.toUpperCase(),
                discription: req.body.discription,
                image: req.file.filename
            }, { new: true })

        } else {
            await Brands.findByIdAndUpdate(id, {
                name: req.body.name.toUpperCase(),
                discription: req.body.discription,

            }, { new: true })
        }

        req.session.alertMessage = {
            type: 'success',
            message: 'Brand Updated'
        };

        res.redirect('/admin/brands')
    } catch (error) {
        console.error('error in post Edit brands', error);
        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/brands')
    }
}


const deleteBrand = async (req, res) => {
    try {
        const id = req.query.id;

        const updatedBrand = await Brands.findOneAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } },
            { new: true } // Return the updated document
        );

        if (!updatedBrand) {
            return res.status(400).json({ error: 'Brand not found' });
        } else {
            return res.status(200).json({ message: 'success' });
        }


    } catch (err) {
        console.error('Error in delete Brand:', err);
        res.status(500).json({ error: 'something went wrong' })
    }
};

module.exports = {
    getBrands, postEditBrand,
    getAddBrand, getEditBrand, postAddBrand, deleteBrand
};
