const Order = require('../../models/order');
const Catagory = require('../../models/catagory');
const User = require('../../models/user')



const getOrders = async (req, res) => {
    try {
        const allOrders = await Order.find({ isDeleted: false })
        // console.log('All Orders',allOrders)
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allOrders.length / 5);
        const currentOrder = allOrders.slice(startindex, endindex);
        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;
        res.render('admin/orders', {
            orders: currentOrder,
            totalpages, currentpage, message: '', alertMessage
        })
    } catch (error) {
        console.log('Error in get orders eroor', error)
    }
}

const shippOrder = async (req, res) => {
    try {
        let id = req.query.id;
        let updateOrder = await Order.findByIdAndUpdate({ _id: id },
            { $set: { status: 'Delevered' } }
        );
        console.log('updated Order', updateOrder);
        res.redirect('/admin/orders')
    } catch (error) {
        console.log('Error in get orders eroor', error)
    }
}

const unShippOrder = async (req, res) => {
    try {
        let id = req.query.id;
        let updateOrder = await Order.findByIdAndUpdate({ _id: id },
            { $set: { status: 'Placed' } }
        );
        console.log('updated Order', updateOrder);
        res.redirect('/admin/orders')
    } catch (error) {
        console.log('Error in get orders eroor', error)
    }
}
const deleteOrder = async (req, res) => {
    try {
        let id = req.query.id;
        console.log(req.query)
        await Order.findOneAndUpdate({ _id: id }, {
            $set: {
                isDeleted: true
            }
        }).then(() => {
            req.session.alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Order deleted'
            };

            res.redirect('/admin/orders')
        })
    } catch (error) {
        console.log(`ERROR IN DELETING ORDER, ERROR:${error}`)
    }
}

const cancelOrder = async (req, res) => {
    try {
        console.log('cancellled')
        let id = req.query.id || null;
        console.log(id)

        if (id) {
            let id = req.query.id;
            let updateOrder = await Order.findByIdAndUpdate({ _id: id },
                { $set: { status: 'Cancelled' } }
            );
            console.log('updated Order', updateOrder);
            res.redirect('/admin/orders')
        } else {
            req.session.alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Some thing went wrong'
            };
            res.redirect('/profile')
        }
    } catch (error) {
        console.log('Error in cancel order', error)
    }
}
module.exports = { getOrders, shippOrder, unShippOrder, deleteOrder }