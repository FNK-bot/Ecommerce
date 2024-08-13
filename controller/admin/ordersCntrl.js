const Order = require('../../models/order');
const Catagory = require('../../models/catagory');
const User = require('../../models/user')



const getOrders =  async(req,res)=>{
    try {
        const allOrders= await Order.find()
        // console.log('All Orders',allOrders)
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allOrders.length / 5);
        const currentOrder = allOrders.slice(startindex,endindex);
        console.log('Order id =',allOrders._id)
        console.log('current Orders',currentOrder);
        res.render('admin/orders',{ orders: currentOrder,
            totalpages,currentpage,message:''})
    } catch (error) {
        console.log('Error in get orders eroor',error)
    }
}

const shippOrder = async(req,res)=>{
    try {
        let id = req.query.id;
        let updateOrder = await Order.findByIdAndUpdate({_id:id},
        {$set:{status:'shipped'}}
        ) ;
        console.log('updated Order',updateOrder);
        res.redirect('/admin/orders')
    } catch (error) {
        console.log('Error in get orders eroor',error)
    }
}

const unShippOrder = async(req,res)=>{
    try {
        let id = req.query.id;
        let updateOrder = await Order.findByIdAndUpdate({_id:id},
        {$set:{status:'Not-Shipped'}}
        ) ;
        console.log('updated Order',updateOrder);
        res.redirect('/admin/orders')
    } catch (error) {
        console.log('Error in get orders eroor',error)
    }
}
const deleteOrder = async (req,res)=>{
    try {
        let id = req.query.id;
        console.log(req.query)
        let deleteOrder = await Order.findByIdAndDelete(id);
        console.log('deleted',deleteOrder);
        res.redirect('/admin/orders')
    } catch (error) {
        console.log(`ERROR IN DELETING ORDER, ERROR:${error}`)   
    }
}
module.exports = {getOrders,shippOrder,unShippOrder,deleteOrder}