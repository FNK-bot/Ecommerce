const Catogary = require('../../models/catagory')

const getAllCatagory = async (req, res) => {
    try {
        //Fetch All Catogary data
        const getAllCatogary = await Catogary.find({ isDeleted: false });

        //pagination Logic
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(getAllCatogary.length / 3);
        const currentproduct = getAllCatogary.slice(startindex, endindex);

        //handle client side messages
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/catagorys', { catogary: currentproduct, totalpages, currentpage, alertMessage })

    } catch (error) {

        console.error('error in Catagorys', error);
        res.status(500).json({ message: 'Internal server Error' })
    }
}


const getAddCatagory = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/addCatagory', { alertMessage })
    } catch (error) {
        console.error('error in addCatagorys', error);
        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/catagorys')
    }
};

const postAddCatagory = async (req, res) => {
    try {
        const { name, discription } = req.body;
        let image = req?.file;

        if (!name || !image) {
            req.session.alertMessage = {
                type: 'error',
                message: 'All Field is Required '
            };
            return res.redirect('/admin/addCatagory')
        }

        if (!discription) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Description needed'
            };
            return res.redirect('/admin/addCatagory')
        }

        const catogaryExist = await Catogary.findOne({ name });
        if (catogaryExist) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Catagory already exists'
            };
            return res.redirect('/admin/addCatagory')
        }
        else {
            let image = null;
            if (req.file) {
                image = req.file.filename;
            }

            const newCatogary = new Catogary({
                name: name.toUpperCase(),
                discription,
                image,
            });

            await newCatogary.save();
            req.session.alertMessage = {
                type: 'success',
                message: 'New Catagory Added'
            };

            return res.redirect('/admin/addCatagory')
        }


    } catch (error) {
        console.error('error in post Catagorys ', error);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/addCatagory');
    }
}

//edit Catagory
const getEditCatagory = async (req, res) => {
    try {
        const id = req.query.id;

        const catagory = await Catogary.findById(id);
        if (!catagory || catagory.isDeleted) {
            req.session.alertMessage = {
                type: 'error',
                message: "catogory not found"
            }
            return res.redirect('/admin/catagorys');
        }

        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null

        res.render('admin/editCatagory', { alertMessage, catagory })

    } catch (error) {
        console.error('error in get edit Catagorys ', error);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/catagorys');
    }
}

const postEditCatagory = async (req, res) => {
    try {

        const id = req.query.id;

        const img = req.file ? req.file.filename : null; // Check if req.file is defined
        if (img) {

            await Catogary.findByIdAndUpdate(id, {
                name: req.body.name.toUpperCase(),
                discription: req.body.discription,
                image: req.file.filename
            }, { new: true })

        } else {

            await Catogary.findByIdAndUpdate(id, {
                name: req.body.name.toUpperCase(),
                discription: req.body.discription,

            }, { new: true })
        }

        req.session.alertMessage = {
            type: 'success',
            message: 'Catagory Updated'
        };
        res.redirect('/admin/Catagorys')
    } catch (error) {
        console.error('error in post edit Catagorys ', error);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/editCatagory');
    }
}

const deleteCatagory = async (req, res) => {
    try {
        const id = req.query.id;

        const updatedCatagory = await Catogary.findOneAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } },
            { new: true } // Return the updated document
        );

        if (!updatedCatagory) {
            return res.status(400).json({ error: 'catagory not found' });
        } else {
            return res.status(200).json({ message: 'success' });
        }


    } catch (err) {
        console.error('Error in delete category:', err);
        res.status(500).json({ error: 'something went wrong' })
    }
};

module.exports = {
    getAllCatagory, postEditCatagory,
    getAddCatagory, getEditCatagory, postAddCatagory, deleteCatagory
};
