const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const bcrypt = require('bcrypt');
const Order = require('../../models/order');
const { isValidObjectId } = require('mongoose')

// hashed password
const generateHashedPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};



//Profile landing
const getProfile = async (req, res) => {
    try {
        // Fetch user information
        const user = await User.findById(req.session.user_id)

        // Fetch orders for the user
        const orders = await Order.find({
            userId: req.session.user_id,
            isDeleted: false
        })
            .sort({ createdOn: -1 })
            .populate({
                path: 'productDetails.ProductId',
                select: 'name' // Select only the product name field from the Product model
            });

        // Sort the transactionHistory by date in descending order
        user.transactionHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        //Filter addres by Not Deleted
        user.address = user.address.filter((item) => !item.isDeleted)

        // Prepare alert message
        let alertMessage = req.session.alertMessage;
        req.session.alertMessage = null;


        res.render('user-views/profile', { user, alertMessage, orders });
    } catch (error) {
        console.error("Error while getting profile: ", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
};



//address
const getAddAdress = async (req, res) => {
    try {
        //fetch User
        let user = await User.findById({ _id: req.session.user_id })

        //Prepare alert Message
        const alertMessage = req.session.alertMessage;
        req.session.alertMessage = null;

        res.render('user-views/addAdress', { user, alertMessage })
    } catch (error) {
        console.error('Error in get address error', error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


const postAddAddress = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id })

        // creating new Address
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

        //set as main Address if only one address
        if (user.address.length == 1) {
            user.address[0].isMain = true;
        }

        // Save the user 
        await user.save();

        // Set success message and redirect
        req.session.alertMessage = {
            type: 'success',
            message: 'New Address Added'
        };
        res.redirect('/profile');

    } catch (error) {
        console.error(`Error In Post Add Address Error ${error}`)

        //set Error Message and redirecr
        req.session.alertMessage = {
            type: 'error',
            message: 'Cannot Add New Address'
        };
        res.redirect('/profile')
    }
}


const getEditAdress = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id);

        const id = req.query.id;

        // Find the specific address by ID
        const address = user.address.id(id);

        // Check if the address exists or deleted
        if (!address || address.isDeleted) {
            req.session.alertMessage = {
                type: 'error',
                message: 'Address not found ,it may be deleted'
            };
            return res.redirect('/profile');
        }

        //Prepare alert Message
        const alertMessage = req.session.alertMessage;
        req.session.alertMessage = null;

        res.render('user-views/editAdress', { user, alertMessage, address });
    } catch (error) {
        console.error(`Error in getEditAdress: ${error}`);

        req.session.alertMessage = {
            type: 'error',
            message: 'Cannot Edit Address'
        };
        res.redirect('/profile');
    }
};


const postEditAdress = async (req, res) => {
    try {

        const user = await User.findById(req.session.user_id);

        const addressId = req.body.addressId;
        const address = user.address.id(addressId);

        if (address) {
            // Update the address fields
            address.adressType = req.body.addressType;
            address.name = req.body.name;
            address.mobile = req.body.phone;
            address.city = req.body.city;
            address.pinCode = req.body.pin;
            address.addressLine = req.body.addressLine1;
            address.areaStreet = req.body.areaStreet;
            address.district = req.body.district;
            address.landmark = req.body.landmark;

            // Save the updated user 
            await user.save();

            req.session.alertMessage = {
                type: 'success',
                message: 'Address updated successfully'
            };

            return res.redirect('/profile');

        } else {

            // Handle  address is not found
            req.session.alertMessage = {
                type: 'error',
                message: 'Cannot Edit Address, Address not found.'
            };

            return res.redirect('/profile');
        }
    } catch (error) {

        console.error(`Error in postEditAdress: ${error}`);

        req.session.alertMessage = {
            type: 'error',
            message: 'An error occurred while updating the address.'
        };
        return res.redirect('/profile');
    }
};


//delete address api ctrl
const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id);

        // Get the address ID from the request body
        const id = req.body.id;
        if (!id) {
            return res.status(400).json({ error: 'Address not found' });
        }

        const addressToDelete = user.address.id(id);
        // Check if the address exists
        if (!addressToDelete) {
            return res.status(400).json({ error: 'Address not found' });
        }

        // Mark the address as deleted
        addressToDelete.isDeleted = true;

        // Save the updated user
        await user.save();

        return res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error(`Error while deleting address: ${error}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};




//Edit profile Data
const getEditProfile = async (req, res) => {
    try {
        // Fetch user
        const user = await User.findById(req.session.user_id);

        // Render page
        res.render('user-views/editProfile', { user });

    } catch (error) {

        console.error('Error in edit profile:', error);

        req.session.alertMessage = {
            type: 'error',
            message: 'Some thig went wrong'
        };
        return res.redirect('/profile');
    }
};


const postEditProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user_id);

        // Handle image upload
        let image = req.file ? req.file.filename : null;

        // Update user profile
        const updatedData = {
            username: req.body.name,
            mobile: req.body.phone,
            ...(image && { image }) // Conditionally add image if it exists
        };

        await User.findByIdAndUpdate(req.session.user_id, updatedData, { new: true });

        // Set success message
        req.session.alertMessage = {
            type: 'success',
            message: 'Profile updated successfully'
        };

        res.redirect('/profile');
    } catch (error) {

        console.log(`Error in post edit profile: ${error}`);
        req.session.alertMessage = {
            type: 'error',
            message: 'Cannot update profile'
        };
        res.redirect('/profile');
    }
};


const getChangePassword = async (req, res) => {
    try {
        let user = await User.findById({ _id: req.session.user_id });

        let alertMessage = req.session.alertMessage;
        req.session.alertMessage = null;

        res.render('user-views/changePassword', { user, alertMessage });
    } catch (error) {

        console.error(`error in get change password: ${error}`);

        req.session.alertMessage = {
            type: 'error', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Cannot  change password'
        };
        res.redirect('/profile');
    }
};

const postChangePassword = async (req, res) => {
    try {
        //validate current Password 
        let currentPassword = req.body.currentPassword || false;

        let { newPassword, confirmPassword } = req.body;
        let user = await User.findById({ _id: req.session.user_id })
        // Handle If current Passsword is there
        if (currentPassword) {
            if (newPassword !== confirmPassword) {
                req.session.alertMessage = {
                    type: 'info',
                    message: 'new password and confirm password are not Matched '
                }
                return res.redirect('/changepass');
            }

            if (await user.isPasswordMatched(newPassword)) {
                req.session.alertMessage = {
                    type: 'info',
                    message: 'New Password and Old Password is Same '
                }
                return res.redirect('/changepass');
            }


            if (await user.isPasswordMatched(currentPassword)) {
                let hashed = await generateHashedPassword(confirmPassword);
                user.password = hashed;
                await user.save()
                req.session.alertMessage = {
                    type: 'success',
                    message: 'Password Changed'
                }
                return res.redirect('/profile')
            }
            else {

                req.session.alertMessage = {
                    type: 'error',
                    message: 'Old Password is Wrong'
                }
                return res.redirect('/changepass');
            }


        }
        // Handle If not current Passsword 
        else if (!currentPassword && !user.password) {
            let hashed = await generateHashedPassword(confirmPassword);
            user.password = hashed;
            await user.save()

            req.session.alertMessage = {
                type: 'success',
                message: 'Password Changed'
            }
            return res.redirect('/profile')
        }
        else {

            req.session.alertMessage = {
                type: 'error',
                message: 'Enter the fields'
            }
            return res.redirect('/changepass');
        }

    } catch (error) {
        console.error(`error in post change password`)

        req.session.alertMessage = {
            type: 'error', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Cannot  change password'
        };
        res.redirect('/profile')
    }
}

const cancelOneItem = async (req, res) => {
    try {
        //oid --Order ID
        //iid --Order item ID( id of Product Details item)
        const { oid, iid } = req.body;

        // Validate query parameters
        if (!oid || !iid || !isValidObjectId(oid) || !isValidObjectId(iid)) {
            return res.status(400).json({ error: 'Product Not Found' });
        }

        // Find the order by ID
        const findOrder = await Order.findById(oid);
        if (!findOrder) {
            return res.status(400).json({ error: 'Ordered Product Not Found' });
        }

        // Find the user by session ID
        let user = await User.findById({ _id: req.session.user_id });

        // Update the order item status to "Cancelled"
        await Order.updateOne(
            { _id: oid, "productDetails._id": iid },
            { $set: { "productDetails.$.status": "Cancelled", status: 'some item Cancelled' } }
        );

        //Produt(item)
        const item = findOrder.productDetails.id(iid);

        // Calculate refund amount
        const refundAmount = item.total;

        // Add refund to user's wallet and log the transaction
        user.wallet += parseInt(refundAmount);
        user.transactionHistory.push({ amount: refundAmount });
        await user.save();

        // Manage stock by incrementing the product quantity
        await Product.findOneAndUpdate(
            { _id: item.ProductId },
            { $inc: { quantity: item.quantity } }
        );

        // Set success message and send response
        const alertMessage = {
            type: 'success',
            message: `Order Item Cancelled ₹${refundAmount} is Added to Your Wallet`
        };
        req.session.alertMessage = alertMessage;

        return res.status(200).json({ message: 'Success' });


    } catch (error) {

        console.error('Error in Cancel One Item:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const returnOneItem = async (req, res) => {
    try {
        //oid --Order ID
        //iid --Order item ID( id of Product Details item)
        const { oid, iid } = req.body;

        // Validate order ID and item ID
        if (!oid || !iid || !isValidObjectId(oid) || !isValidObjectId(iid)) {
            return res.status(400).json({ error: 'Ordered Product Not Found' });
        }

        // Find order by ID
        const findOrder = await Order.findById(oid);
        if (!findOrder) {
            return res.status(400).json({ error: 'Order not found' });
        }

        let user = await User.findById({ _id: req.session.user_id });

        // Update order item status and order status
        await Order.updateOne(
            { _id: oid, "productDetails._id": iid },
            { $set: { "productDetails.$.status": "Returned", status: 'some item returned' } }
        );

        // Get the refunded item and calculate refund amount
        const item = findOrder.productDetails.id(iid); //Produt(item)
        const refundAmount = item.total;

        // Add refund to user's wallet and transaction history
        user.wallet += parseInt(refundAmount);
        user.transactionHistory.push({ amount: refundAmount });
        await user.save();

        // Manage product stock
        await Product.findOneAndUpdate({ _id: item.ProductId },
            { $inc: { quantity: item.quantity } });

        // Set success message and send response
        const alertMessage = {
            type: 'success',
            message: `Order Item Refunded ₹${refundAmount} is Added to Your Wallet`
        };
        req.session.alertMessage = alertMessage;

        res.status(200).json({ message: 'success' });
    } catch (error) {
        console.error('Error in Return One Item:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getProfile, getEditAdress, getEditProfile, getAddAdress,
    postAddAddress, deleteAddress, postEditProfile, postEditAdress
    , getChangePassword, postChangePassword,
    cancelOneItem, returnOneItem
}