const Catogary = require('../../models/catagory')

const getAllCatagory = async (req, res) => {
    try {
        const getAllCatogary = await Catogary.find({ isDeleted: false });
        console.log(getAllCatogary)
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(getAllCatogary.length / 3);
        const currentproduct = getAllCatogary.slice(startindex, endindex);
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/catagorys', { catogary: currentproduct, totalpages, currentpage, alertMessage })

    } catch (error) {
        console.log('error in Catagorys')
    }
}

//add catagary

const getAddCatagory = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/addCatagory', { alertMessage })
    } catch (error) {
        console.log('error in addCatagorys', error)
    }
}
const postAddCatagory = async (req, res) => {
    try {
        const { name, discription } = req.body;
        let image = req?.file;
        console.log(req.body)
        console.log('file', req.file)
        if (name == undefined || image == undefined || discription == undefined) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'All Field is Required '
            };
            res.redirect('/admin/addCatagory')
        }

        if (!discription) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Description needed'
            };
            res.redirect('/admin/addCatagory')
        }

        const catogaryExist = await Catogary.findOne({ name });
        if (catogaryExist) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Catagory already exists'
            };
            res.redirect('/admin/addCatagory')
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
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'New Catagory Added'
            };
            res.redirect('/admin/addCatagory')
            console.log('newCatogary:', newCatogary);
        }


    } catch (error) {
        console.log('error in post Catagorys ' + error)
    }
}

//edit Catagory

const getEditCatagory = async (req, res) => {
    try {
        const id = req.query.id;
        const catagory = await Catogary.findById(id)
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null
        res.render('admin/editCatagory', { alertMessage, catagory })
    } catch (error) {
        console.log('error in Catagorys')
    }
}
const postEditCatagory = async (req, res) => {
    try {
        console.log('req.query', req.query)
        const id = req.query.id;
        console.log(id)
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
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Catagory Updated'
        };
        res.redirect('/admin/Catagorys')
    } catch (error) {
        console.log('error in post Catagorys')
    }
}


const deleteCatagory = async (req, res) => {
    try {
        console.log(req.query.id)
        const id = req.query.id;
        await Catogary.findOneAndUpdate({ _id: id }, {
            $set: {
                isDeleted: true
            }
        }).then(() => {
            req.session.alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'catagory deleted'
            };

            res.redirect('/admin/Catagorys')
        })
    }
    catch (err) {
        console.log('error in delete catagory', err)
    }
}
module.exports = {
    getAllCatagory, postEditCatagory,
    getAddCatagory, getEditCatagory, postAddCatagory, deleteCatagory
};
