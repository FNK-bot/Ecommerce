const Order = require('../../models/order');
const Catagory = require('../../models/catagory');
const User = require('../../models/user')
const Product = require('../../models/product')
const Coupen = require('../../models/coupen')


const getCoupens = async (req, res) => {
    try {
        const allCoupens = await Coupen.find({ isDeleted: false }).sort({ createdOn: -1 })
        console.log('All coupens', allCoupens)
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
        console.log('Error in get all coupens eroor', error)
    }
}


const getAddCoupen = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/addCoupen', { alertMessage })
    }
    catch (err) {
        console.log("Error in get Add Coupen", err)
    }
}

const postAddCoupen = async (req, res) => {
    try {
        console.log('post data coupens')
        console.log(req.body)
        let { name, code, date, percentage } = req.body;
        let checkCodeExist = await Coupen.find({ code })
        console.log(checkCodeExist)
        if (checkCodeExist.length > 0) {
            req.session.alertMessage = {
                type: 'error',
                message: "Code already exist"
            }
            res.redirect('addCoupen')
        }
        else {
            let newCoupen = new Coupen({
                name,
                expiry: date,
                percentage,
                code
            })
            await newCoupen.save()
            req.session.alertMessage = {
                type: 'success',
                message: "Coupen created"
            }
            res.redirect('coupens')
        }
    }
    catch (err) {
        console.log("Error in post Add Coupen", err)
    }
}

const getEditCoupen = async (req, res) => {
    try {
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        let id = req.query.id;
        let coupen = await Coupen.findById(id)
        res.render('admin/editCoupen', { coupen, alertMessage })
    }
    catch (err) {
        console.log("Error in get edit Coupen", err)
    }
}

const postEditCoupen = async (req, res) => {
    try {
        console.log('post data coupens')
        console.log(req.body)
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
        console.log("Error in post edit Coupen", err)
    }
}

const deleteCoupen = async (req, res) => {
    try {
        console.log(req.body);
        let { id } = req.body;
        await Coupen.findOneAndUpdate({ _id: id }, {
            $set: { isDeleted: true }
        })
        req.session.alertMessage = {
            type: 'success',
            message: 'Coupen Deleted'
        }
        res.status(200).json({ message: 'deleted succesfully' })
    } catch (error) {
        console.log("Error While Deleting the coupen ", error)
    }
}
module.exports = { getCoupens, getAddCoupen, postAddCoupen, deleteCoupen, getEditCoupen, postEditCoupen }