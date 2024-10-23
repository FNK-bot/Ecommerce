const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const mongoose = require('mongoose');
const Order = require('../../models/order');
const Razorpay = require('razorpay');
const Coupens = require('../../models/coupen')
const dotenv = require('dotenv');
dotenv.config();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { isValidObjectId } = require('mongoose');

//coupen generator function
function coupenGenerator() {
    let coupen = '';
    let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 10; i++) {
        coupen += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return coupen;
}

//generte oderId function
function generateOderId() {
    let digits = "1234567890";
    let otp = "";
    for (i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// reset coupen 
async function resetCoupen(req) {
    let user_id = req.session.user_id;
    let user = await User.findById(user_id);
    //handle coupen
    user.cart.coupon = { code: '', isApplyed: false };
    user.cart.discount = 0;
    await user.save();
}

//load cart items page
const getCart = async (req, res) => {
    try {

        //Fetch user
        let user_id = req.session.user_id;
        let user = await User.findById(user_id).populate('cart.cartItems.ProductId');

        let cartItems = user.cart.cartItems;

        // Calculate total and subTotal
        let total_ = 0;
        let subTotal = 0;
        cartItems.forEach((val) => {
            total_ += val.total;
            subTotal += val.total;
        });

        let discount = user.cart.discount;
        let total = total_ - discount;


        // Handle alert message for the session
        let alertMessage = null;
        if (req.session.alertMessage) {
            alertMessage = {
                type: req.session.mType,
                message: req.session.mContent,
            };
            req.session.alertMessage = null;
            req.session.mType = null;
            req.session.mContent = null;
        }

        res.render('user-views/cart', {
            cart: cartItems,
            total,
            subTotal,
            discount,
            alertMessage
        });

    } catch (error) {
        console.error(`Error in get cart Error:${error}`);
        res.status(500).json({ message: 'Internal server Error' });
    }
};

//Add to Cart
const postAddtoCart = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id);
        let { product_id } = req.body;

        // Check if the product exists and has stock available
        let findProduct = await Product.findOne({ _id: product_id, isDeleted: false });
        if (!findProduct) {
            return res.status(404).json({ message: `Product not found`, messageType: 'error' });
        }

        if (findProduct.quantity < 1) {
            return res.status(400).json({ message: `Product is Out of Stock`, messageType: 'info' });
        }

        // Check if the product is already in the cart
        let alreadyIn = user.cart.cartItems.find(cart_item => cart_item.ProductId.toString() === product_id);
        if (alreadyIn) {
            return res.status(200).json({ message: `${findProduct.name} is already in the cart`, messageType: 'info' });
        }

        // Add the product to the cart
        user.cart.cartItems.push({
            ProductId: findProduct._id,
            quantity: 1,
            total: findProduct.price
        });
        await user.save();

        //handle coupen
        await resetCoupen(req);
        return res.status(200).json({ message: `${findProduct.name} is added to the cart`, messageType: 'success' });

    } catch (error) {

        console.log(`Error in adding to cart: ${error}`);
        res.status(500).json({ message: `Error while adding to cart` });
    }
};


const putIncrementQnt = async (req, res) => {
    try {
        const pid = req.body.pid || null;

        // Validate product ID
        if (!pid || !isValidObjectId(pid)) {
            return res.status(400).json({ message: 'Product Not Found' });
        }

        let user = await User.findById(req.session.user_id);

        // Fetch product
        let product = await Product.findOne({ _id: pid, isDeleted: false });

        // Handle no product found
        if (!product) {
            return res.status(400).json({ message: 'Product Not Found or Deleted' });
        }

        // Check if product is in cart
        let cart = user.cart.cartItems.find(item => item.ProductId == pid);
        if (!cart) {
            return res.status(400).json({ message: 'Product Not Found In Cart' });
        }

        //handle coupen
        await resetCoupen(req);

        // Handle quantity increment
        if (cart.quantity < product.quantity) {
            // Increment the quantity
            await User.updateOne(
                { _id: req.session.user_id, 'cart.cartItems.ProductId': pid },
                {
                    $inc: {
                        'cart.cartItems.$.quantity': 1,
                        'cart.cartItems.$.total': product.price,
                    },
                },
                { new: true }
            );

            let UpdatedUser = await User.findById(req.session.user_id);
            let singleTotal = (cart.quantity + 1) * product.price;
            let cartQnt = cart.quantity + 1;
            let total = 0;
            let subTotal = 0;

            UpdatedUser.cart.cartItems.forEach(val => {
                total += val.total;
                subTotal += val.total;
            });

            return res.status(200).json({
                message: 'Quantity incremented',
                messageType: 'success',
                cartQnt, singleTotal, total, subTotal, ms: false
            });
        }

        // If quantity exceeds product stock after increment (stock Updated By Admin)
        if (cart.quantity > product.quantity) {
            await User.updateOne(
                { _id: req.session.user_id, 'cart.cartItems.ProductId': pid },
                {
                    $set: {
                        'cart.cartItems.$.quantity': product.quantity,
                        'cart.cartItems.$.total': product.quantity * product.price
                    }
                },
                { new: true }
            );

            let UpdatedUser = await User.findById(req.session.user_id);
            let singleTotal = product.quantity * product.price;
            let cartQnt = product.quantity;
            let total = 0;
            let subTotal = 0;

            UpdatedUser.cart.cartItems.forEach(val => {
                total += val.total;
                subTotal += val.total;
            });

            return res.status(200).json({
                message: 'Product stock updated. Cart quantity set to maximum available quantity.',
                messageType: 'info',
                cartQnt, singleTotal, total, subTotal, ms: true
            });
        }

        // No more to add case 
        let singleTotal = cart.quantity * product.price;
        let cartQnt = cart.quantity;
        let total = 0;
        let subTotal = 0;

        user.cart.cartItems.forEach(val => {
            total += val.total;
            subTotal += val.total;
        });

        return res.status(200).json({
            message: 'No more left to add',
            messageType: 'info',
            cartQnt, singleTotal, total, subTotal, ms: true
        });

    } catch (error) {
        console.error(`Error while adding quantity: ${error}`);
        res.status(500).json({ message: 'Error while adding to cart', messageType: 'error' });
    }
};

// Decrement the cart quantity
const putDecrementQnt = async (req, res) => {
    try {
        // Product Id (pid)
        const pid = req.body.pid;

        // Fetch user and product
        let user = await User.findById(req.session.user_id);
        let product = await Product.findById(pid);

        if (!product) {
            return res.status(400).json({ message: 'Product Not Found or Deleted' });
        }

        // Find product in cart
        let cart = user.cart.cartItems.find(item => item.ProductId == pid);
        if (!cart) {
            return res.status(400).json({ message: 'Product Not Found In Cart' });
        }

        //handle coupen
        await resetCoupen(req);

        // Handle case where product quantity is greater than available stock (invalid in decrement context)
        // While Admin changed the stock While user performed
        if (cart.quantity > product.quantity) {
            await User.updateOne(
                { _id: req.session.user_id, 'cart.cartItems.ProductId': pid },
                {
                    $set: {
                        'cart.cartItems.$.quantity': product.quantity,
                        'cart.cartItems.$.total': product.quantity * product.price,
                    }
                },
                { new: true }
            );

            let updatedUser = await User.findById(req.session.user_id);
            let singleTotal = product.quantity * product.price;
            let cartQnt = product.quantity;
            let total = 0;
            let subTotal = 0;

            updatedUser.cart.cartItems.forEach((val) => {
                total += val.total;
                subTotal += val.total;
            });

            return res.status(200).json({
                message: `Product stock updated. Cart quantity set to maximum available quantity.`,
                messageType: 'info',
                cartQnt, singleTotal, total, subTotal, ms: true,
            });
        }

        // Decrement quantity if greater than 1
        if (cart.quantity > 1) {
            await User.updateOne(
                { _id: req.session.user_id, 'cart.cartItems.ProductId': pid },
                {
                    $inc: {
                        'cart.cartItems.$.quantity': -1,
                        'cart.cartItems.$.total': -product.price,
                    },
                },
                { new: true }
            );

            let updatedUser = await User.findById(req.session.user_id);
            let singleTotal = (cart.quantity - 1) * product.price;
            let cartQnt = cart.quantity - 1;
            let total = 0;
            let subTotal = 0;

            updatedUser.cart.cartItems.forEach((val) => {
                total += val.total;
                subTotal += val.total;
            });

            return res.status(200).json({
                message: `Quantity decremented`,
                messageType: 'success',
                cartQnt, singleTotal, total, subTotal, ms: false,
            });
        }

        // Handle case where quantity is 1 (minimum required)
        else {
            let singleTotal = cart.quantity * product.price;
            let cartQnt = cart.quantity;
            let total = 0;
            let subTotal = 0;

            user.cart.cartItems.forEach((val) => {
                total += val.total;
                subTotal += val.total;
            });

            return res.status(200).json({
                message: `Minimum 1 required or you can delete`,
                messageType: 'info',
                cartQnt, singleTotal, total, subTotal, ms: true
            });
        }

    } catch (error) {
        console.error(`Error while decrementing quantity: ${error}`);
        res.status(500).json({ message: `Error while updating cart`, messageType: 'error' });
    }
};


//delete cart item from cart
const deleteCartItem = async (req, res) => {
    try {
        // Cart Item ID (cid)
        let cid = req.body.cid || null;

        if (!cid || !isValidObjectId(cid)) {
            return res.status(400).json({ message: 'Cart item Not Found to Delete' });
        }

        // Fetch user
        let user = await User.findById(req.session.user_id);

        // Check if cart item exists
        let isCartItemValid = user.cart.cartItems.id(cid);
        if (!isCartItemValid) {
            return res.status(400).json({ message: 'Cart item Not Found to Delete' });
        }

        // Use $pull to remove the item from cartItems array
        await User.findOneAndUpdate(
            { _id: req.session.user_id },
            {
                $pull: { 'cart.cartItems': { _id: cid } }  // Proper use of $pull to remove by item id
            },
            { new: true }
        );

        //handle coupen
        await resetCoupen(req);

        return res.status(200).json({ message: 'Item successfully deleted from cart' });
    } catch (error) {
        console.error(`Error while deleting item: ${error}`);
        res.status(500).json({ message: 'Error while deleting item from cart' });
    }
};

//checkout ctrl
const getCheckOut = async (req, res) => {
    try {

        // Fetch user
        let user_id = req.session.user_id;
        let user = await User.findById(user_id).populate('cart.cartItems.ProductId');

        // Check if the user or cart is invalid
        if (!user || user.cart.cartItems.length === 0) {
            return res.redirect('/cart');
        }

        let cartHasExceededQuantity = false;
        let updatedCart = false;

        // Validate cart quantities and check for deleted products
        for (let item of user.cart.cartItems) {
            // If product is not found, redirect to cart
            if (!item.ProductId) {
                return res.redirect('/cart');
            }

            const cartQuantity = item.quantity;
            const availableQuantity = item.ProductId.quantity;

            // If the cart quantity exceeds available stock
            if (cartQuantity > availableQuantity) {
                cartHasExceededQuantity = true;

                // Update the cart with available stock
                await User.updateOne(
                    { _id: user_id, 'cart.cartItems.ProductId': item.ProductId._id },
                    {
                        $set: {
                            'cart.cartItems.$.quantity': availableQuantity,
                            'cart.cartItems.$.total': availableQuantity * item.ProductId.price
                        }
                    }
                );
                updatedCart = true;
            }

            // Remove the product if it is marked as deleted
            if (item.ProductId.isDeleted) {
                await User.updateOne(
                    { _id: user_id },
                    {
                        $pull: {
                            'cart.cartItems': { ProductId: item.ProductId._id }
                        }
                    }
                );
                updatedCart = true;
            }
        }

        // If the cart was updated, redirect the user to the cart page
        if (updatedCart) {
            req.session.mType = 'info';
            req.session.mContent = 'Cart updated due to stock or product changes. Please review your cart before checkout.';
            return res.redirect('/cart');
        }

        // Map products from populated cart items
        let product = user.cart.cartItems.map(item => item.ProductId);

        // Calculate totals and discounts
        let cart = user.cart.cartItems;
        let total_ = 0;
        let subTotal = 0;
        cart.forEach(item => {
            total_ += item.total;
            subTotal += item.total;
        });

        let discount = user.cart.discount || 0;
        let total = total_ - discount;

        // Filter out deleted addresses
        let address = user.address.filter(item => !item.isDeleted);

        // Render the checkout page
        res.render('user-views/checkout', {
            user,
            cart,
            address,
            product,
            totalCartPrice: total,
            subTotal,
            discount
        });

    } catch (error) {
        console.error(`ERROR IN GET CHECKOUT ERROR: ${error}`);
        req.session.alertMessage = { type: 'error', message: 'Something went wrong during checkout. Please try again.' };
        return res.redirect('/cart');
    }
};


// post check Out page
const postChekOut = async (req, res) => {
    try {
        //fetch user
        let user = await User.findById(req.session.user_id);

        // Map Product Ids from User cart
        const product_ids = user.cart.cartItems.map((item) => {
            return item.ProductId
        });

        //assign user cart
        let cart = user.cart;

        //total cart amount
        let totalCartAmount = cart.cartItems.reduce((acc, item) => acc + item.total, 0);

        //product details which used for creating order
        const products_details = await Promise.all(user.cart.cartItems.map(async (item) => {
            //Logic to adjust discount amount from each product

            let findProduct = await Product.findById(item.ProductId);

            // Calculate the percentage of the discount for the total cart amount
            let percentage = (user.cart.discount / totalCartAmount) * 100;

            // Find how much amount is discounted for total product 
            let diffrenceAmount = Math.floor(((item.quantity * findProduct.price) * percentage) / 100);

            return {
                status: 'Paid',
                ProductId: item.ProductId,
                quantity: item.quantity,
                singleProductActualPrice: findProduct.price,
                total: (item.quantity * findProduct.price) - diffrenceAmount, // Decrease the discount price from actual price by percentage
            };

        }));

        let total_ = 0;
        let subTotal = 0;
        user.cart.cartItems.forEach((val) => {
            total_ += val.total;
            subTotal += val.total;
        });

        let discount = user.cart.discount;
        let total = total_ - discount

        // Utility function to manage stock
        const manageStock = async (productDetails) => {
            for (let item of productDetails) {
                await Product.updateOne(
                    { _id: item.ProductId },
                    { $inc: { quantity: -item.quantity } }
                );
            }
        }

        //Handle RazorPay 
        if (req.body.paymentMethod === 'Razorpay') {

            //razorpay Logic
            let instance = new Razorpay({
                key_id: process.env.razorpay_id,
                key_secret: process.env.razorpay_secret,
            });
            const razorpayOrder = await instance.orders.create({
                amount: total * 100,
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
                payment_capture: 1
            });

            let orderId = generateOderId();
            let addressId = req.body.address
            let address = user.address.find((item) => {
                return item._id.toString() === addressId.toString()
            })

            let newOrder = new Order({
                orderID: orderId,
                totalPrice: 0,
                date: new Date(Date.now()).toISOString().slice(0, 10),
                productId: product_ids,
                userId: user._id,
                method: 'razorpay',
                status: 'Payment Pending',
                address: address,
                discount: user.cart.discount,
                productDetails: products_details,
                onlinePayment: {
                    status: 'initial',
                    isOnlinePayment: true,
                    orderId: razorpayOrder.id
                },
            })
            await newOrder.save()

            return res.json({
                message: 'Razorpay gateway',
                order_id: razorpayOrder.id,
                amount: total * 100,
                currency: "INR",
                userName: user?.username,
                userEmail: user.email,
                userMobile: user.mobile
            });


        }

        //Handle Razorpay If Paid (payment Completed)
        if (req.body.paymentStatus === 'Paid') {

            //fetch Order
            let findOrder = await Order.findOne({ 'onlinePayment.orderId': req.body.orderId })

            //Update Order
            findOrder.onlinePayment.paymentId = req.body.paymentId;
            findOrder.onlinePayment.status = 'Paid';
            findOrder.onlinePayment.isPaid = true;
            findOrder.status = 'Placed';
            findOrder.totalPrice = total

            //change orde item status to paid
            findOrder.productDetails.forEach((item) => {
                item.status = 'Paid'
            })

            await findOrder.save();

            //manage the stock
            await manageStock(products_details)

            //clear cart
            user.cart = {};
            await user.save()

            res.json({ orderId: findOrder.orderID })
        }

        //Handle Razorpay If Pending  (payment not Completed/closed or exited razorpay gateway )
        if (req.body.paymentStatus === 'Pending') {

            //fetch Order
            let findOrder = await Order.findOne({ 'onlinePayment.orderId': req.body.orderId })

            //Update Order
            findOrder.onlinePayment.status = 'on payment';
            findOrder.onlinePayment.isPaid = false;
            //change orde item status to pending
            findOrder.productDetails.forEach((item) => {
                item.status = 'on payment'
            })
            await findOrder.save();

            return res.json({ orderId: findOrder.orderID })

        }

        //Handle Cash On Delevery Method
        if (req.body.paymentMethod === 'cod') {

            let orderId = generateOderId();
            let addressId = req.body.address
            //finding Address Data from user
            let address = user.address.find((item) => {
                return item._id.toString() === addressId.toString()
            })


            //manage the stock
            await manageStock(products_details)

            //creating and saving New Order
            let newOrder = new Order({
                orderID: orderId,
                totalPrice: total,
                date: new Date(Date.now()).toISOString().slice(0, 10),//
                productId: product_ids,
                userId: user._id,
                method: 'cod',
                status: 'Placed',
                address: address,
                discount: user.cart.discount,
                productDetails: products_details,
            })
            await newOrder.save()

            //clear cart
            user.cart = {};
            await user.save()

            return res.json({ orderId: orderId, paymentCod: true })

        }

        //Handle Wallet Payment
        if (req.body.paymentMethod === 'wallet') {

            let orderId = generateOderId();
            let addressId = req.body.address
            let address = user.address.find((item) => {
                return item._id.toString() === addressId.toString()
            })


            //manage the stock
            await manageStock(products_details)

            //creating New order
            let newOrder = new Order({
                orderID: orderId,
                totalPrice: total,
                date: new Date(Date.now()).toISOString().slice(0, 10),//
                productId: product_ids,
                userId: user._id,
                method: 'wallet',
                status: 'Placed',
                address: address,
                discount: user.cart.discount,
                productDetails: products_details,
            })
            await newOrder.save()

            //clear cart
            user.cart = {};

            // add transaction history on user
            user.transactionHistory.push({
                method: 'wallet',
                amount: total,
                isCredited: false,
                isDebited: true,
            })
            await user.save()

            return res.json({ orderId: orderId, paymentWallet: true })

        }

    } catch (error) {
        console.error(`ERROR IN POST ORDER , ERROR:${error}`)
        req.session.alertMessage = { type: 'error', message: 'Something went wrong during checkout. Please try again.' };
        return res.redirect('/cart');
    }
}



//pay on order page for failed  payment (pay on profile page order)
const payOnOderPage = async (req, res) => {
    try {
        const orderId = req.body.orderId;

        // Fetch user 
        const user = await User.findById(req.session.user_id);

        // Calculate totals
        let total_ = 0;
        let subTotal = 0;
        user.cart.cartItems.forEach((item) => {
            total_ += item.total;
            subTotal += item.total;
        });

        let discount = user.cart.discount || 0;
        let total = total_ - discount;

        // Handle order initiation (initial Razorpay request)
        if (orderId) {
            const order = await Order.findById(orderId);
            if (!order) {
                req.session.alertMessage = { type: 'error', message: 'Order not found.' };
                return res.redirect('/profile');
            }
            return res.json({
                message: 'Razorpay gateway',
                order_id: order.onlinePayment.orderId,
                amount: total * 100,
                currency: "INR",
                userName: user?.username,
                userEmail: user.email,
                userMobile: user?.mobile,
                isInetiated: true,
            });
        }

        // Handle paid request from Razorpay
        if (req.body.paymentStatus === 'Paid') {
            const findOrder = await Order.findOne({ 'onlinePayment.orderId': req.body.payment_orderId });
            if (!findOrder) {
                req.session.alertMessage = { type: 'error', message: 'Order not found for payment.' };
                return res.redirect('/profile');
            }

            // Update payment status and order
            findOrder.onlinePayment.paymentId = req.body.paymentId;
            findOrder.onlinePayment.status = 'Paid';
            findOrder.onlinePayment.isPaid = true;
            findOrder.status = 'Placed';
            findOrder.totalPrice = total;
            findOrder.date = new Date(Date.now()).toISOString().slice(0, 10);
            //change orde item status to paid
            findOrder.productDetails.forEach((item) => {
                item.status = 'Paid'
            })
            await findOrder.save();

            // Manage stock and update product quantities
            const productsDetails = user.cart.cartItems;
            for (let item of productsDetails) {
                await Product.updateOne(
                    { _id: item.ProductId },
                    { $inc: { quantity: -item.quantity } }
                );
            }

            // Clear user cart
            user.cart = {};
            await user.save();

            // Respond with the order ID
            return res.json({ orderId: findOrder.orderID });
        }

    } catch (error) {
        console.error('Error in Pay on order page: ', error);
        req.session.alertMessage = { type: 'error', message: 'Something went wrong. Please try again.' };
        return res.redirect('/profile');
    }
};



//Generate Invoice
const generateInvoicePDF = async (orderDetails, user) => {
    try {
        // Get list of Product IDs from order details
        const list = orderDetails.productDetails.map((item) => item.ProductId);

        // Fetch product names based on the IDs
        const products = await Product.find({ _id: { $in: list } });

        const dirPath = path.join(__dirname, '../../public/admin/assets/invoice');
        fs.mkdirSync(dirPath, { recursive: true });

        const filePath = path.join(dirPath, `invoice_${orderDetails.orderID}.pdf`);
        const doc = new PDFDocument({ margin: 30 });
        doc.pipe(fs.createWriteStream(filePath));

        // Header Section
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Order Details
        doc.fontSize(12).text(`Order ID: ${orderDetails.orderID}`);
        doc.text(`Date: ${new Date(orderDetails.createdOn).toLocaleDateString()}`);
        doc.text(`Customer: ${user.username}`);
        doc.text(`Payment Method: ${orderDetails.method}`);
        doc.text(`Status: ${orderDetails.status}`);
        doc.moveDown();

        // Product Details
        doc.fontSize(14).text('Products:');
        doc.moveDown(0.5);

        // Table Header
        const tableTop = doc.y;
        const col1 = 30, col2 = 250, col3 = 350, col4 = 450;

        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Product Name', col1, tableTop);
        doc.text('Quantity', col2, tableTop);
        doc.text('Price', col3, tableTop);
        doc.text('Total', col4, tableTop);
        doc.moveTo(30, doc.y + 10).lineTo(570, doc.y + 10).stroke();
        doc.moveDown();

        // Table Rows
        doc.font('Helvetica');
        orderDetails.productDetails.forEach((product, index) => {
            const rowTop = doc.y;

            doc.moveTo(30, doc.y + 10).lineTo(570, doc.y + 10).stroke();
            doc.moveDown();
            doc.text(products[index].name, col1, rowTop, { width: 200, align: 'left' });
            doc.text(product.quantity, col2, rowTop, { width: 100, align: 'left' });
            doc.text(`${product.total}`, col3, rowTop, { width: 100, align: 'left' });
            doc.text(`${product.total}`, col4, rowTop, { width: 100, align: 'left' });
        });

        doc.moveDown();
        doc.moveDown();

        // Summary Section
        doc.fontSize(12);
        doc.text(`Total Price: ${orderDetails.totalPrice}`);
        doc.text(`Discount: ${orderDetails.discount}`);
        doc.text(`Shipping Charge: ${orderDetails.shippingCharge}`);
        doc.text(`Grand Total: ${orderDetails.totalPrice - orderDetails.discount + orderDetails.shippingCharge}`);

        doc.moveDown();
        doc.text('Thank you for your purchase!', { align: 'center' });

        // Finalize PDF
        doc.end();
        console.log('PDF created at', filePath);

        return filePath;

    } catch (error) {
        console.error('Error generating invoice PDF', error);
        throw error;
    }
};



// get Order success Page 
const getOrderSuccess = async (req, res) => {
    try {
        // Get order ID from query parameters
        let orderId = req.query.id;
        if (!orderId) {
            req.session.alertMessage = { type: 'error', message: 'Order not found.' };
            return res.redirect('/checkOut');
        }

        //validate order id
        const order = await Order.findOne({ orderID: orderId });
        if (!order) {
            req.session.alertMessage = { type: 'error', message: 'Order not found.' };
            return res.redirect('/profile');
        }
        // Fetch suggested products
        let suggestedProducts = await Product.find().limit(4);


        // Handle session alert message 
        let alertMessage = req.session.alertMessage || null;
        req.session.alertMessage = null;

        res.render('user-views/orderSuccess', {
            orderId,
            product: suggestedProducts,
            alertMessage
        });

    } catch (error) {
        console.error(`ERROR IN GET ORDER SUCCESS PAGE: ${error}`);
        req.session.alertMessage = { type: 'error', message: 'Something went wrong. Please try again.' };
        return res.redirect('/profile');
    }
};

// invoice Api ctrl
const invoice = async (req, res) => {
    try {
        let orderId = req.query.id;
        let user = await User.findById(req.session.user_id);

        // Find the order by orderID
        const order = await Order.findOne({ orderID: orderId });

        // If order is found
        if (order) {
            // Generate the invoice PDF
            let filePath = await generateInvoicePDF(order, user);

            // Download the invoice and then delete the file
            setTimeout(() => {
                res.download(filePath, 'invoice.pdf', (err) => {
                    if (err) {
                        console.log('Error downloading file:', err);
                        res.status(500).send("Error downloading file");
                    } else {
                        // Clean up the file after it's downloaded
                        fs.unlinkSync(filePath);
                    }
                });
            }, 1000)
        } else {
            // No order found
            console.log('No order found for the provided ID.');
            res.status(404).json({ error: 'Order not found' });
        }

    } catch (error) {
        console.error('Error in invoice API controller:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//coupen Cntrl
const getCoupens = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id);
        let myCoupens = await Coupens.find({ isDeleted: false });

        // Render the coupons page
        res.render('user-views/coupens', { coupens: myCoupens, user });

    } catch (error) {
        console.error(`Error while getting the coupons page: ${error}`);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const applyCoupen = async (req, res) => {
    try {
        // Fetch user
        let user = await User.findById(req.session.user_id);

        // Calculate cart total
        let cartTotal = user.cart.cartItems.reduce((acc, cartItem) => acc + cartItem.total, 0);

        if (cartTotal === 0) {
            return res.status(400).json({ msg: 'Cart is empty', isValid: false });
        }

        // Validate coupon code
        let clientCode = req.body.code;
        let coupon = await Coupens.findOne({ isDeleted: false, code: clientCode });

        if (coupon) {
            //validate Expiry
            let currentDate = new Date();
            if (currentDate > new Date(coupon.expiryDate)) {
                return res.status(400).json({
                    msg: 'Coupon has expired',
                    isValid: false,
                });
            }

            // Calculate discount
            let calculatedDiscountAmount = Math.floor((cartTotal * coupon.percentage) / 100);
            let discountAmount = Math.min(calculatedDiscountAmount, 500); // Ensure discount amount not morethan 500(limiting offer);
            let updatedTotal = cartTotal - discountAmount;

            // Update user cart with discount and coupon
            user.cart.discount = discountAmount;
            user.cart.coupon.code = clientCode;
            user.cart.coupon.isApplyed = true;
            await user.save();

            // Return success response
            return res.status(200).json({
                msg: calculatedDiscountAmount < 500 ? 'Coupon Applied Successfully' : 'Maximum Coupen Discount Applied',
                total: updatedTotal,
                discount: discountAmount,
                isValid: true,
            });
        } else {
            // Invalid coupon code
            return res.status(400).json({
                msg: 'Invalid Coupon Code',
                isValid: false,
            });
        }
    } catch (error) {
        console.error('Error while applying coupon:', error);
        return res.status(500).json({ msg: 'Internal Server Error', isValid: false });
    }
};

//Cancel Coupen Api ctrl
const cancelCoupen = async (req, res) => {
    try {

        // Fetch the user
        let user = await User.findById(req.session.user_id);

        // Check if there is any coupon applied
        if (!user.cart.coupon.isApplyed) {
            return res.status(400).json({
                msg: 'No coupon applied',
                isValid: false,
            });
        }

        // Check if the coupon being canceled matches the applied one
        let clientCode = req.body.code;
        if (user.cart.coupon.code !== clientCode) {
            return res.status(400).json({
                msg: 'Coupon does not match the applied one',
                isValid: false,
            });
        }

        // Remove the coupon and reset the discount
        user.cart.discount = 0;
        user.cart.coupon.code = '';
        user.cart.coupon.isApplyed = false;
        await user.save();

        // Calculate the new cart total (without the discount)
        let cartTotal = user.cart.cartItems.reduce((acc, cartItem) => {
            return acc + cartItem.total;
        }, 0);


        // Return response
        return res.status(200).json({
            msg: 'Coupon removed successfully',
            total: cartTotal,
            discount: 0,
            isValid: true,
        });

    } catch (error) {
        console.error('Error while canceling coupon:', error);
        return res.status(500).json({ msg: 'Error while canceling coupon' });
    }
};

module.exports = {
    getCart, postAddtoCart, putIncrementQnt, putDecrementQnt, deleteCartItem,
    getCheckOut, getOrderSuccess, postChekOut, getCoupens, applyCoupen,
    cancelCoupen, invoice, payOnOderPage,
};