const Coupen = require('../../models/coupen')


const getCoupens = async (req, res) => {
    try {
        //fetch all coupens from coupens collection
        const allCoupens = await Coupen.find({ isDeleted: false }).sort({ createdOn: -1 })

        //Pagination Logic
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allCoupens.length / 6);
        const currentCoupen = allCoupens.slice(startindex, endindex);

        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/allCoupens', {
            coupens: currentCoupen,
            totalpages, currentpage, message: '', alertMessage
        })
    } catch (error) {
        console.error('Error in get all coupens eroor', error);
        res.status(500).json({ message: 'Internal server Error' })
    }
}


const getAddCoupen = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/addCoupen', { alertMessage })
    }
    catch (err) {
        console.error("Error in get Add Coupen", err);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/coupens')
    }
}

const postAddCoupen = async (req, res) => {
    try {
        let { name, code, date, percentage } = req.body;

        let checkCodeExist = await Coupen.findOne({ code })

        if (checkCodeExist) {
            req.session.alertMessage = {
                type: 'error',
                message: "Code already exist"
            }
            return res.redirect('addCoupen')
        }
        else {
            let newCoupen = new Coupen({
                name,
                expiry: date,
                percentage,
                code
            });
            await newCoupen.save()

            req.session.alertMessage = {
                type: 'success',
                message: "Coupen created"
            }
            return res.redirect('coupens')
        }
    }
    catch (err) {
        console.log("Error in post Add Coupen", err);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/addCoupen')
    }
}


const getEditCoupen = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        let id = req.query.id;
        let coupen = await Coupen.findById(id)

        if (!coupen || coupen.isDeleted) {
            req.session.alertMessage = {
                type: 'error',
                message: "coupen Not found"
            }
            return res.redirect('/admin/coupens')

        }
        res.render('admin/editCoupen', { coupen, alertMessage })
    }
    catch (err) {
        console.error("Error in get edit Coupen", err);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/coupens')

    }
}

const postEditCoupen = async (req, res) => {
    try {

        let { name, code, date, percentage, id } = req.body;

        await Coupen.findOneAndUpdate({ _id: id }, {
            $set: {
                name,
                code,
                expiry: date,
                percentage,
            }
        })

        req.session.alertMessage = {
            type: 'success',
            message: "Coupen Updated"
        }

        res.redirect('coupens')

    }
    catch (err) {
        console.error("Error in post edit Coupen", err);

        req.session.alertMessage = {
            type: 'error',
            message: "Something went wrong"
        }
        res.redirect('/admin/coupens')
    }
}

const deleteCoupen = async (req, res) => {
    try {

        let { id } = req.body;

        let updatedData = await Coupen.findOneAndUpdate({ _id: id }, {
            $set: { isDeleted: true }
        }, { new: true })

        if (!updatedData) {
            return res.status(400).json({ error: 'coupen not found' })
        }

        res.status(200).json({ message: 'deleted succesfully' });

    } catch (error) {

        console.error("Error While Deleting the coupen ", error);
        res.status(500).json({ error: 'Internal server' })
    }
}
module.exports = { getCoupens, getAddCoupen, postAddCoupen, deleteCoupen, getEditCoupen, postEditCoupen }