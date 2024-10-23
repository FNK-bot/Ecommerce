const Order = require('../../models/order');
const Catagory = require('../../models/catagory');
const User = require('../../models/user');
const { isValidObjectId } = require('mongoose');



const getOrders = async (req, res) => {
    try {
        //fetch All Orders
        const allOrders = await Order.find({ isDeleted: false }).sort({ createdOn: -1 })

        //Pagination Logic
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allOrders.length / 6);
        const currentOrder = allOrders.slice(startindex, endindex);

        let alertMessage = req.session.alertMessage
        req.session.alertMessage = null;

        res.render('admin/orders', {
            orders: currentOrder,
            totalpages, currentpage, message: '', alertMessage
        })
    } catch (error) {
        console.error('Error in get orders eroor', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deleteOrder = async (req, res) => {
    try {
        let id = req.query.id;

        let updateData = await Order.findOneAndUpdate(
            { _id: id },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!updateData) {
            return res.status(404).json({ error: "Order Not found" })
        };

        res.status(200).json({ message: 'success' })

    } catch (error) {
        console.error(`ERROR IN DELETING ORDER, ERROR:${error}`);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



// Order details ctrl
const getOrderDetails = async (req, res) => {
    try {
        const oid = req.query.id;

        const findOrder = await Order.findById(oid).populate({
            path: 'productDetails.ProductId',
            select: 'name',
        });

        if (!findOrder) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Something went Wrong'
            };
            return res.redirect('orders');
        }

        const orderDetails = findOrder.productDetails;

        res.render('admin/orderDetails', { orderDetails, oid });
    } catch (error) {
        console.error("Error in Get Order details ", error);

        req.session.alertMessage = {
            type: 'error',
            message: 'Something went Wrong'
        };

        return res.redirect('orders');

    }
}

// delever one item
const deleverOneItem = async (req, res) => {
    try {
        let { oid, iid } = req.query;


        const order = await Order.findOneAndUpdate(
            { _id: oid, "productDetails._id": iid },
            {
                $set: {
                    "productDetails.$.status": "Delevered",
                    status: 'some Item Delevered',
                    "productDetails.$.isDelevered": true,

                }
            }, { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: "Order Not found" })
        };

        console.log(order)

        // Check if all items in the order are delevered
        let allDelevered = order.productDetails.every(item => item.isDelevered);
        order.isAllDelevered = allDelevered;
        order.status = allDelevered ? 'All Delevered' : 'Some Item Delevered';

        // Save the updated order
        await order.save();

        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.error('Error in delver one item Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// ship one item
const shipOneItem = async (req, res) => {
    try {
        let { oid, iid } = req.query;

        const order = await Order.updateOne(
            { _id: oid, "productDetails._id": iid },
            {
                $set: {
                    "productDetails.$.status": "Shipped",
                    status: 'some Item are Shipped',

                }
            }, { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: "Order Not found" })
        };

        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.error('Error in ship one item Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// place one item
const placeOneItem = async (req, res) => {
    try {
        let { oid, iid } = req.query;

        const order = await Order.updateOne(
            { _id: oid, "productDetails._id": iid },
            {
                $set: {
                    "productDetails.$.status": "Placed",
                    status: 'some Item are placed',

                }
            }, { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: "Order Not found" })
        };

        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.error('Error in place one item Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// ship one item
const OneItemMarkAsOnDelevery = async (req, res) => {
    try {
        let { oid, iid } = req.query;

        const order = await Order.updateOne(
            { _id: oid, "productDetails._id": iid },
            {
                $set: {
                    "productDetails.$.status": "on Delevery",
                    status: 'some Item are on Delevery',

                }
            }, { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: "Order Not found" })
        };

        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.error('Error in OneItemMarkAsOnDelevery Error', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports = {
    getOrders, deleteOrder, getOrderDetails, deleverOneItem,
    placeOneItem, shipOneItem, OneItemMarkAsOnDelevery
}