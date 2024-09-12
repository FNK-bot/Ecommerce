const Brands = require('../../models/brand')

const getBrands = async (req, res) => {
    try {
        const allBrands = await Brands.find({ isDeleted: false });
        console.log(allBrands)
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allBrands.length / 3);
        const currentproduct = allBrands.slice(startindex, endindex);
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/allBrand', { brands: currentproduct, totalpages, currentpage, alertMessage })

    } catch (error) {
        console.log('error in get all Brands', error)
    }
}

//add catagary

const getAddBrand = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/addBrand', { alertMessage })
    } catch (error) {
        console.log('error in get addBrand', error)
    }
}
const postAddBrand = async (req, res) => {
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
            res.redirect('/admin/addBrand')
        }

        if (!discription) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Description needed'
            };
            res.redirect('/admin/addBrand')
        }

        const brandExist = await Brands.findOne({ name });
        if (brandExist) {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Brand already exists'
            };
            res.redirect('/admin/addBrand')
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
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'New Brand Added'
            };
            res.redirect('/admin/addBrand')
            console.log('newBrand:', newBrand);
        }


    } catch (error) {
        console.log('error in post addBrand ' + error)
    }
}

//edit Catagory

const getEditBrand = async (req, res) => {
    try {
        const id = req.query.id;
        const brandExist = await Brands.findById(id)
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null
        res.render('admin/editBrand', { brand: brandExist, alertMessage })
    } catch (error) {
        console.log('error in Get edit Brand')
    }
}
const postEditBrand = async (req, res) => {
    try {
        console.log('req.query', req.query)
        const id = req.query.id;
        console.log(id)
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
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Brand Updated'
        };
        res.redirect('/admin/brands')
    } catch (error) {
        console.log('error in post Edit brands')
    }
}


const deleteBrand = async (req, res) => {
    try {
        console.log(req.query.id)
        const id = req.query.id;
        await Brands.findOneAndUpdate({ _id: id }, {
            $set: {
                isDeleted: true
            }
        }).then(() => {
            req.session.alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Brand deleted'
            };

            res.redirect('/admin/brands')
        })
    }
    catch (err) {
        console.log('error in delete brand', err)
    }
}
module.exports = {
    getBrands, postEditBrand,
    getAddBrand, getEditBrand, postAddBrand, deleteBrand
};
