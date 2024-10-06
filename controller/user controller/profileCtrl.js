const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const bcrypt = require('bcrypt');
const Order = require('../../models/order');


// hashed password
const generateHashedPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};



//landing
const getProfile = async (req, res) => {

    let user = await User.findById({ _id: req.session.user_id })
    // const orders = await Order.find({ userId: req.session.user_id, isDeleted: false });
    const orders = await Order.find({
        userId: req.session.user_id,
        isDeleted: false
    })
        .sort({ createdOn: -1 })
        .populate({
            path: 'productDetails.ProductId', // Path to the ProductId field
            select: 'name' // Select only the product name field from the Product model
        });

    console.log('orders', orders);
    try {
        let alertMessage;
        if (!req.session.alertMessage) {
            alertMessage = {
                type: req.session.mType,
                message: req.session.mContent,
            }
        }
        else {
            alertMessage = req.session.alertMessage
        }

        req.session.alertMessage = null;
        req.session.mType = ' ';
        req.session.mContent = " ";
        // console.log(`User profile User Data : ${user}`)

        // console.log('order.productDetails', orders[0].productDetails[0].ProductId.name)

        res.render('user-views/profile', { user, alertMessage, orders })

    } catch (error) {
        console.log("error while getting profile error", error)
    }
}

//address
const getAddAdress = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        const alertMessage = null
        res.render('user-views/addAdress', { user, alertMessage })
    } catch (error) {
        console.log('Error in get address error', error)
    }
}


const postAddAddress = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        console.log(req.body)
        const newAddress = {
            addressType: req.body.addressType,
            addressLine: req.body.addressLine1,
            name: req.body.name,
            mobile: req.body.phone,
            city: req.body.city,
            areaStreet: req.body.areaStreet,
            district: req.body.district,
            landmark: req.body.landmark,
            pinCode: req.body.pin,
        }
        user.address.push(newAddress)
        if (user.address.length == 1) {
            user.address.isMain = true;
        }
        if (await user.save()) {
            const alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'New Adress Added'
            };
            req.session.alertMessage = alertMessage;
            res.redirect('/profile')

        }
        else {
            const alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Cannot Add New Address'
            };
            req.session.alertMessage = alertMessage;
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(`Error In Post Add Address Error ${error}`)

        const alertMessage = {
            type: 'error',
            message: 'Cannot Add New Address'
        };
        req.session.alertMessage = alertMessage;
        res.redirect('/profile')
    }
}

const getEditAdress = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        let id = req.query.id;
        let address = user.address.id(id)
        const alertMessage = null;
        console.log(`Edit address : user obj \n ${address}`)
        res.render('user-views/editAdress', { user, alertMessage, address })
    } catch (error) {
        console.log(`Error In get edit Address Error ${error}`)

        const alertMessage = {
            type: 'error',
            message: 'Cannot Edit Address'
        };
        req.session.alertMessage = alertMessage;
        res.redirect('/profile')
    }
}

const postEditAdress = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        console.log(`post Edit Address body `, req.body)
        const addressId = req.body.addressId;
        const address = user.address.id(addressId);
        let alertMessage = null;
        if (address) {
            console.log('adress  found')
            address.adressType = req.body.addressType;
            address.name = req.body.name;
            address.mobile = req.body.phone;
            address.city = req.body.city;
            address.pinCode = req.body.pin;
            address.addressLine = req.body.addressLine1;
            address.areaStreet = req.body.areaStreet;
            address.district = req.body.district;
            address.landmark = req.body.landmark;
            await user.save()
            req.session.mType = 'success'
            req.session.mContent = 'Address updated successfully'
            res.redirect('/profile')
        }
        else {
            console.log('adress not found')
            alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Cannot Edit Address'
            };
            req.session.alertMessage = alertMessage;
            res.redirect('/profile')
        }
        // req.session.alertMessage = alertMessage;
        // res.redirect('/profile')
    } catch (error) {
        console.log(`Error In post edit Address Error ${error}`)
        const alertMessage = {
            type: 'error',
            message: 'Cannot Edit Address'
        }
        req.session.alertMessage = alertMessage;
        res.redirect('/profile')
    }
}


const getDeleteAddress = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        const id = req.query.id;
        let deleteAdress = user.address.id(id)
        deleteAdress.isDeleted = true;
        if (await user.save()) {
            const alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Adress Deleted'
            };
            req.session.alertMessage = alertMessage;
            res.redirect('/profile')
        }
        else {
            const alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Cannot  delete  Address'
            };
            req.session.alertMessage = alertMessage;
            res.redirect('/profile')
        }
    } catch (error) {
        console.log(`Erro while deleting address`)
        const alertMessage = {
            type: 'error',
            message: 'Cannot delete  Address'
        };
        req.session.alertMessage = alertMessage;
        res.redirect('/profile')
    }
}





//profile

const getEditProfile = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        res.render('user-views/editProfile', { user })
    } catch (error) {

    }
}




const postEditProfile = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        console.log(`Posted data from post edit - ${req.body.name}`);
        console.log(req.body)
        // console.log(`Posted image from post edit - ${req.file.filename}`);
        let image = null;
        try {
            image = req.file.filename
        } catch (error) {
            console.log('error in reciving image ')
        }
        console.log('image', image)

        if (image) {
            console.log(`image is uploaded`)
            await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                username: req.body.name,
                mobile: req.body.phone,
                image: image

            }, { new: true })
        }
        else {
            console.log(`image is not uploaded`)
            await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                username: req.body.name,
                mobile: req.body.phone,
            }, { new: true })
        }
        const alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Profile Updated'
        };
        req.session.alertMessage = alertMessage;
        res.redirect('/profile')

    } catch (error) {
        console.log(`error in post edit profile error : ${error}`)
        const alertMessage = {
            type: 'error', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Cannot  update  Profile'
        };
        req.session.alertMessage = alertMessage;
        res.redirect('/profile')
    }

}

const getChangePassword = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })
        let alertMessage = {
            type: req.session.mType,
            message: req.session.mContent,
        }
        req.session.mType = ' ';
        req.session.mContent = " ";
        res.render('user-views/changePassword', { user, alertMessage });
    } catch (error) {
        console.log(`error in get change password`)
        req.session.alertMessage = {
            type: 'error', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Cannot  get change password'
        };
        res.redirect('/profile')
    }
}
const postChangePassword = async (req, res) => {
    try {
        let currentPassword = req.body.currentPassword ? req.body.currentPassword : false;
        console.log('curr', currentPassword)
        let { newPassword, confirmPassword } = req.body;
        let user = await User.findById({ _id: req.session.user_id })
        if (currentPassword) {
            if (await user.isPasswordMatched(currentPassword) && !(currentPassword == newPassword)) {
                console.log('pass matched');
                let hashed = await generateHashedPassword(confirmPassword);
                user.password = hashed;
                await user.save()
                req.session.mType = 'success';
                req.session.mContent = "Password changed ";
                res.redirect('/profile')
            }

            if (currentPassword == newPassword) {
                req.session.mType = 'info';
                req.session.mContent = "new password and Current password is same ";
                res.redirect('/profile');
            }
            else {
                req.session.mType = 'error';
                req.session.mContent = "Current password is wrong ";
                res.redirect('/changepass');
            }
        }
        else {
            req.session.mType = 'error';
            req.session.mContent = "Enter the Fieds ";
            res.redirect('/changepass');
        }

    } catch (error) {
        console.log(`error in post change password`)
    }
}

//return and cancel order
const returnOrder = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id });
        const order_id = req.query.id;
        const order = await Order.findById(order_id);
        console.log('returned order', order)
        order.isReturned.status = true;
        order.isReturned.isRefunded = true;
        order.isReturned.refundAmount = order.totalPrice;
        order.status = 'returned';
        // order.totalPrice = 0;
        req.session.mType = 'success'
        req.session.mContent = `₹${order.totalPrice} is added to youre wallet please check balence`;
        user.wallet = user.wallet + order.totalPrice,
            user.transactionHistory.push({
                amount: order.totalPrice
            })

        //manage stock
        for (let item of order.productDetails) {
            await Product.updateOne(
                { _id: item.ProductId }, // Find the product by its ProductId
                { $inc: { quantity: item.quantity } } // Decrease the quantity using $inc
            );
        }

        await order.save();
        await user.save();

        res.redirect('/profile')
    } catch (error) {
        console.log(`error in return oder err`, error)
    }
}

const cancelOrder = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id });
        const order_id = req.query.id;
        const order = await Order.findById(order_id);
        console.log('cancelled order', order)
        order.status = 'cancelled'
        // order.totalPrice = 0;
        req.session.mType = 'success'
        req.session.mContent = `₹${order.totalPrice} is added to youre wallet please check balence`;
        user.wallet = user.wallet + order.totalPrice,
            user.transactionHistory.push({
                amount: order.totalPrice
            })
        await order.save();
        await user.save();
        //manage stock
        for (let item of order.productDetails) {
            await Product.updateOne(
                { _id: item.ProductId }, // Find the product by its ProductId
                { $inc: { quantity: item.quantity } } // Decrease the quantity using $inc
            );
        }

        res.redirect('/profile')

    } catch (error) {
        console.log('Error in cancel order', error)
    }
}


// Cancel One item From order details
const cancelOneItem = async (req, res) => {
    try {
        console.log(req.query)
        const { oid, iid } = req.query;

        const findOrder = await Order.findById(oid);
        console.log('some')
        let user = await User.findById({ _id: req.session.user_id });

        const order = await Order.updateOne(
            { _id: oid, "productDetails._id": iid }, // Find the order by orderID and the specific product by its _id in productDetails
            {
                $set: { "productDetails.$.status": "Cancelled", status: 'some item Cancelled' } // Use the positional operator $ to update the product's status
            }, {

        }
        );
        const item = findOrder.productDetails.id(iid)
        console.log(item)
        const refundAmaunt = item.total
        // console.log(refundAmaunt)

        user.wallet += parseInt(refundAmaunt);
        user.transactionHistory.push({
            amount: refundAmaunt
        })
        user.save();

        console.log(item.quantity)
        //manage stock
        await Product.findOneAndUpdate({ _id: item.ProductId }, {
            $inc: { quantity: item.quantity },
        });

        const alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: `Order Item cancelled ₹${refundAmaunt} is Added to Youre Wallet`
        };
        req.session.alertMessage = alertMessage;

        res.redirect('/profile')
    } catch (error) {
        console.log('Error in Cancel One item ', error)
    }
}

// Cancel One item From order details
const returnOneItem = async (req, res) => {
    try {
        console.log(req.query)
        const { oid, iid } = req.query;

        const findOrder = await Order.findById(oid);
        console.log('some', findOrder)
        let user = await User.findById({ _id: req.session.user_id });

        const order = await Order.updateOne(
            { _id: oid, "productDetails._id": iid }, // Find the order by orderID and the specific product by its _id in productDetails
            {
                $set: { "productDetails.$.status": "Returned", status: 'some item returned' } // Use the positional operator $ to update the product's status
            }
        );

        const item = findOrder.productDetails.id(iid)
        const refundAmaunt = item.total
        console.log(refundAmaunt)

        user.wallet += parseInt(refundAmaunt);
        user.transactionHistory.push({
            amount: refundAmaunt
        })
        user.save();
        // console.log(user)

        //manage stock
        Product.findOneAndUpdate({ _id: item.ProductId }, {
            $inc: { quantity: item.quantity }
        });

        const alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: `Order Item Refunded ₹${refundAmaunt} is Added to Youre Wallet`
        };
        req.session.alertMessage = alertMessage;

        res.redirect('/profile')
    } catch (error) {
        console.log('Error in Return One item ', error)
    }
}
module.exports = {
    getProfile, getEditAdress, getEditProfile, getAddAdress,
    postAddAddress, getDeleteAddress, postEditProfile, postEditAdress
    , getChangePassword, postChangePassword, returnOrder, cancelOrder,
    cancelOneItem, returnOneItem
}