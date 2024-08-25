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



//utility


//landing
const getProfile = async (req, res) => {

    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    console.log('orders', orders);
    try {

        let alertMessage = {
            type: req.session.mType,
            message: req.session.mContent,
        }

        req.session.mType = ' ';
        req.session.mContent = " ";
        console.log(`User profile User Data : ${user}`)


        res.render('user-views/profile', { user, alertMessage, orders })

    } catch (error) {
        console.log("error while getting profile error", error)
    }
}

//address
const getAddAdress = async (req, res) => {

    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    try {
        let user = await User.findById({ _id: req.session.user_id })
        const alertMessage = null
        res.render('user-views/addAdress', { user, alertMessage, orders, orderAddress })
    } catch (error) {

    }
}


const postAddAddress = async (req, res) => {

    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    // let user = await User.findById({_id:req.session.user_id})
    try {
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
            res.render('user-views/profile', { user, alertMessage, orders, orderAddress })
        }
        else {
            const alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Cannot Add New Address'
            };
            res.render('user-views/profile', { user, alertMessage, orders, orderAddress })
        }
    } catch (error) {
        console.log(`Error In Post Add Address Error ${error}`)

        const alertMessage = {
            type: 'error',
            message: 'Cannot Add New Address'
        };
        res.render('user-views/profile', { user, alertMessage, orders, orderAddress });
    }
}

const getEditAdress = async (req, res) => {

    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    // let user = await User.findById({_id:req.session.user_id});
    try {
        let id = req.query.id;
        let address = user.address.id(id)
        const alertMessage = null;
        console.log(`Edit address : user obj \n ${address}`)
        res.render('user-views/editAdress', { address, alertMessage })
    } catch (error) {
        console.log(`Error In get edit Address Error ${error}`)

        const alertMessage = {
            type: 'error',
            message: 'Cannot Edit Address'
        };
        res.render('user-views/profile', { user, alertMessage, orders, orderAddress });

    }
}

const postEditAdress = async (req, res) => {
    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    // let user = await User.findById({_id:req.session.user_id})
    try {
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
            //  alertMessage = {
            //     type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            //     message: 'Address updated successfully.'
            //   };
            // res.redirect(url.format({
            //     pathname:"/profile",
            //     query: {
            //        "Mtype": success'',
            //        "Mcontent": 'Address updated successfully',
            //             }
            //      }))
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
        }


        res.render('user-views/profile', { user, alertMessage, orders, orderAddress })
    } catch (error) {
        console.log(`Error In post edit Address Error ${error}`)

        const alertMessage = {
            type: 'error',
            message: 'Cannot Edit Address'
        };
        res.render('user-views/profile', { user, alertMessage, orders, orderAddress });
    }
}


const getDeleteAddress = async (req, res) => {
    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    // let user = await User.findById(req.session.user_id);
    try {
        const id = req.query.id;
        let deleteAdress = user.address.id(id)
        deleteAdress.isDeleted = true;
        if (await user.save()) {
            const alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Adress Deleted'
            };
            res.render('user-views/profile', { user, alertMessage, orders, orderAddress })
        }
        else {
            const alertMessage = {
                type: 'error', // Can be 'success', 'error', 'warning', or 'info'
                message: 'Cannot  delete  Address'
            };
            res.render('user-views/profile', { user, alertMessage, orders, orderAddress })
        }
    } catch (error) {
        console.log(`Erro while deleting address`)
        const alertMessage = {
            type: 'error',
            message: 'Cannot delete  Address'
        };
        res.render('user-views/profile', { user, alertMessage, orders, orderAddress });
    }
}





//profile

const getEditProfile = async (req, res) => {
    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    try {
        let user = await User.findById({ _id: req.session.user_id })
        res.render('user-views/editProfile', { user })
    } catch (error) {

    }
}




const postEditProfile = async (req, res) => {
    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    try {
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
        let user = await User.findById({ _id: req.session.user_id })
        const alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Profile Updated'
        };
        res.render('user-views/profile', { user, alertMessage, orders, orderAddress })

    } catch (error) {
        let user = await User.findById({ _id: req.session.user_id })
        console.log(`error in post edit profile error : ${error}`)
        const alertMessage = {
            type: 'error', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Cannot  update  Profile'
        };
        res.render('user-views/profile', { user, alertMessage, orders, orderAddress })
    }

}

const getChangePassword = async (req, res) => {
    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    try {
        let user = await User.findById({ _id: req.session.user_id })
        let alertMessage = {
            type: req.session.mType,
            message: req.session.mContent,
        }
        req.session.mType = ' ';
        req.session.mContent = " ";
        res.render('user-views/changePassword', { user, alertMessage, orders, orderAddress });
    } catch (error) {
        console.log(`error in get change password`)
    }
}
const postChangePassword = async (req, res) => {
    let user = await User.findById({ _id: req.session.user_id })
    const orders = await Order.find({ userId: req.session.user_id });
    // console.log('orders',orders);       
    const orderAddress = user.address.
        find(addressItem => orders.find(orderItem => addressItem._id.toString() === orderItem.addressId.toString()));
    // console.log('order address',orderAddress)
    try {
        let userId = req.session.user_id;
        let currentPassword = req.body.currentPassword ? req.body.currentPassword : false;
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
                // setTimeout((req,res)=>{
                //     req.session.userAuth = false;
                // },100)
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
            console.log('creating new password matched');
            let hashed = await generateHashedPassword(confirmPassword);
            user.password = hashed;
            await user.save()
            req.session.mType = 'success';
            req.session.mContent = "New Password Added";
            // setTimeout((req,res)=>{
            //     req.session.userAuth = false;
            // },100)
            res.redirect('/profile')
        }



    } catch (error) {
        console.log(`error in post change password`)
    }
}


module.exports = {
    getProfile, getEditAdress, getEditProfile, getAddAdress,
    postAddAddress, getDeleteAddress, postEditProfile, postEditAdress
    , getChangePassword, postChangePassword,
}