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


//load cart items page

const getCart = async (req, res) => {
    try {
        let user_id = req.session.user_id;
        let user = await User.findById(user_id);
        console.log('cart item looded', user.cart.cartItems)

        const product_ids = user.cart.cartItems.map((item) => {
            return item.ProductId
        })
        console.log('pr id list', product_ids)
        let products = await Product.find({ _id: { $in: product_ids } })
        products = product_ids.map(id => products.find(product => product._id.toString() === id.toString()));
        console.log('pr list', products)
        console.log('cart Items', user.cart.cartItems);

        let total_ = 0;
        let subTotal = 0;
        user.cart.cartItems.forEach((val) => {
            total_ += val.total;
            subTotal += val.total;
        })
        let discount = user.cart.discount;
        let total = total_ - discount

        // let total = user.cart.total;
        // let subTotal = user.cart.subtotal;
        // console.log('subTotal ', subTotal)
        // let discount = user.cart.discount;
        let coupen = user.cart.coupen;
        console.log('coupen get cart', coupen)

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

        res.render('user-views/cart', { cart: user.cart.cartItems, product: products, total, subTotal, discount, coupen, alertMessage })
    } catch (error) {
        console.log(`Error in get cart Error:${error}`)
    }
}

//Add to Cart

const postAddtoCart = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id)
        let { product_id } = req.body;


        let findProduct = await Product.findById(product_id);
        if (findProduct && findProduct.quantity >= 1) {

            let alreadyIn = user.cart?.cartItems.find(cart_item => cart_item?.ProductId == product_id);
            if (alreadyIn) {
                console.log(`${findProduct.name} the product is Already in the cart`)
                return res.status(200).json({ message: `${findProduct.name} the product is Already in the cart`, messageType: 'info' });
            }
            else {
                console.log('here ie sss')
                user.cart.cartItems.push({
                    ProductId: findProduct._id,
                    quantity: 1,
                    total: findProduct.price,

                })
                await user.save()
                console.log(`${user.username} ----> ${findProduct.name} is added to cart`)
                return res.status(200).json({ message: `${findProduct.name} is added to cart`, messageType: 'success' });
            }

        } else {
            return res.status(200).json({ message: `Out of Stock`, messageType: 'info' });
        }
    } catch (error) {
        console.log(`Error in adding to cart Error:${error}`)
        res.status(500).json({ message: `Error while adding to cart` });
    }
}


const putIncrementQnt = async (req, res) => {
    try {
        console.log('put inc ', req.body)
        const sid = req.body.cid
        const product_id = new mongoose.Types.ObjectId(req.body.cid);
        let qnt = parseInt(req.body.qnt);
        console.log(qnt, 'qnt')
        let user = await User.findById(req.session.user_id)
        let product = await Product.findById(product_id)
        console.log('product', product)
        let cart = user.cart.cartItems.find(item => item.ProductId == sid)
        console.log(cart)
        console.log(typeof (product_id))
        if (cart) {
            if (cart.quantity < product.quantity) {
                const updated = await User.updateOne(
                    { _id: req.session.user_id, 'cart.cartItems.ProductId': product_id },
                    {
                        $inc: {
                            'cart.cartItems.$.quantity': 1, // Increment the quantity
                            'cart.cartItems.$.total': product.price, // Update the subtotal
                        },
                    },
                    { new: true }
                );
                let UpdatedUser = await User.findById(req.session.user_id)
                console.log('updated cart', UpdatedUser.cart)
                // UpdatedUser.cart.total += product.price;
                // UpdatedUser.save();
                let singleTotal = (cart.quantity + 1) * product.price;
                let cartQnt = cart.quantity + 1;
                let total = 0;
                let subTotal = 0;
                UpdatedUser.cart.cartItems.forEach((val) => {
                    total += val.total;
                    subTotal += val.total;
                })

                console.log(singleTotal, "sinlge total")
                console.log('qnt added')

                return res.status(200).json({
                    message: `Quantity incremented`, messageType: 'success',
                    cartQnt, singleTotal, total, subTotal, ms: false,
                });
            }

            else if (cart.quantity > product.quantity) {
                const updated = await User.updateOne(
                    { _id: req.session.user_id, 'cart.cartItems.ProductId': product_id },
                    {
                        $set: {
                            'cart.cartItems.$.quantity': product.quantity, // Set quantity to product quantity
                            'cart.cartItems.$.total': product.quantity * product.price, // Set total to quantity * price
                        }
                    },
                    { new: true }
                );
                let UpdatedUser = await User.findById(req.session.user_id)
                console.log('updated cart', UpdatedUser.cart)
                // UpdatedUser.cart.total += product.price;
                // UpdatedUser.save();
                let singleTotal = (product.quantity) * product.price;
                let cartQnt = product.quantity;
                let total = 0;
                let subTotal = 0;
                UpdatedUser.cart.cartItems.forEach((val) => {
                    total += val.total;
                    subTotal += val.total;
                })

                console.log(singleTotal, "sinlge total")
                console.log('qnt added')

                return res.status(200).json({
                    message: `Product Stock updated Youre cart quantity set to maximum cart quantity`, messageType: 'info',
                    cartQnt, singleTotal, total, subTotal, ms: true,
                });
            }
            else {
                let singleTotal = (cart.quantity) * product.price;
                let cartQnt = cart.quantity;
                let total = 0;
                let subTotal = 0;

                user.cart.cartItems.forEach((val) => {
                    total += val.total;
                    subTotal += val.total;
                })
                console.log('no more left to add')
                return res.status(200).json({
                    message: `no more left to add`, messageType: 'info',
                    cartQnt, singleTotal, total, subTotal, ms: true
                });
            }
        }


    } catch (error) {
        console.log(`eroor while adding qnt Eroor;${error}`)
        res.status(500).json({ message: `Error while adding to cart`, messageType: 'error' });
    }
};
const putDecrementQnt = async (req, res) => {
    try {

        console.log('put dec ', req.body)
        const sid = req.body.cid
        const product_id = new mongoose.Types.ObjectId(req.body.cid);
        let qnt = parseInt(req.body.qnt);
        console.log(qnt, 'qnt')
        let user = await User.findById(req.session.user_id)
        let product = await Product.findById(product_id)
        console.log('product', product)
        let cart = user.cart.cartItems.find(item => item.ProductId == sid)
        console.log('cart og ', cart)
        console.log(typeof (product_id))



        if (cart.quantity > product.quantity) {
            const updated = await User.updateOne(
                { _id: req.session.user_id, 'cart.cartItems.ProductId': product_id },
                {
                    $set: {
                        'cart.cartItems.$.quantity': product.quantity, // Set quantity to product quantity
                        'cart.cartItems.$.total': product.quantity * product.price, // Set total to quantity * price
                    }
                },
                { new: true }
            );
            let UpdatedUser = await User.findById(req.session.user_id)
            console.log('updated cart', UpdatedUser.cart)
            // UpdatedUser.cart.total += product.price;
            // UpdatedUser.save();
            let singleTotal = (product.quantity) * product.price;
            let cartQnt = product.quantity;
            let total = 0;
            let subTotal = 0;
            UpdatedUser.cart.cartItems.forEach((val) => {
                total += val.total;
                subTotal += val.total;
            })

            console.log(singleTotal, "sinlge total")
            console.log('qnt added')

            return res.status(200).json({
                message: `Product Stock updated Youre cart quantity set to maximum cart quantity`, messageType: 'info',
                cartQnt, singleTotal, total, subTotal, ms: true,
            });
        }

        if (cart) {
            if (cart.quantity > 1) {
                const updated = await User.updateOne(
                    { _id: req.session.user_id, 'cart.cartItems.ProductId': product_id },
                    {
                        $inc: {
                            'cart.cartItems.$.quantity': -1, // Increment the quantity
                            'cart.cartItems.$.total': -product.price, // Update the subtotal
                        },
                    },
                    { new: true }
                );
                let singleTotal = (cart.quantity - 1) * product.price;
                let cartQnt = cart.quantity - 1;
                let total = 0;
                let subTotal = 0;

                let UpdatedUser = await User.findById(req.session.user_id)
                // UpdatedUser.cart.total -= product.price;
                // UpdatedUser.save();
                console.log('updated cart', UpdatedUser.cart.cartItems)
                UpdatedUser.cart.cartItems.forEach((val) => {
                    total += val.total;
                    subTotal += val.total;
                })
                console.log(singleTotal, "sinlge total")
                console.log('qnt decremented')

                return res.status(200).json({
                    message: `Quantity decremented`, messageType: 'success',
                    cartQnt, singleTotal, total, subTotal, ms: false,
                });
            }


            else {
                let singleTotal = (cart.quantity) * product.price;
                let cartQnt = cart.quantity;
                let total = 0;
                let subTotal = 0;
                user.cart.cartItems.forEach((val) => {
                    total += val.total;
                    subTotal += val.total;
                })
                console.log('Minimum 1 required or you can delete')
                return res.status(200).json({
                    message: `Minimum 1 required or you can delete`, messageType: 'info',
                    cartQnt, singleTotal, total, subTotal, ms: true
                });
            }


        }


    } catch (error) {
        console.log(`eroor while removing qnt Eroor;${error}`)
        res.status(500).json({ message: `Error while adding to cart` });
    }
};

//delete cart item from cart
const deleteCartItem = async (req, res) => {
    try {
        console.log(req.body)
        let id = req.body.id;
        console.log('delte cart item passed id', id)
        let user = await User.findById(req.session.user_id);
        let initialLength = user.cart.cartItems.length;
        let initialData = user.cart.cartItems;

        // Filter out the item by its ProductId
        user.cart.cartItems = user.cart.cartItems.filter(item => item.ProductId != id);
        let checkIsThere = user.cart.cartItems.find(item => item.ProductId.toString() == id.toString());
        if (!checkIsThere) {
            console.log(checkIsThere)
            console.log('cart item not found with id')
        } else {
            console.log(checkIsThere)
            console.log('cart item  found with id')
        }
        if (user.cart.cartItems.length < initialLength) {
            user.markModified('cart');
            await user.save();
            console.log('Cart item deleted');


            console.log(initialData)
            console.log(user.cart.cartItems)
            res.status(200).json({ message: ' Item Deleted successfully' });
        } else {
            res.status(500).json({ message: 'Error: Item not found in cart' });
        }

    } catch (error) {
        console.log(`Error while deleting item: ${error}`);
        res.status(500).json({ message: 'Error while deleting item from cart' });
    }
};


// checkout Ctrl
const getCheckOut = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id)

        //check here

        //check user cart is empty
        if (user.cart.cartItems.length <= 0) {
            console.log('cart is empty ')
            res.redirect('cart')
        } else {

            const product_ids = user.cart.cartItems.map((item) => {
                return item.ProductId
            })
            let products = await Product.find({ _id: { $in: product_ids } })
            products = product_ids.map(id => products.find(product => product._id.toString() === id.toString()));

            let cart = user.cart.cartItems;
            let address = user.address;
            let total_ = 0;
            let subTotal = 0;
            user.cart.cartItems.forEach((val) => {
                total_ += val.total;
                subTotal += val.total;
            })
            let discount = user.cart.discount;
            let total = total_ - discount

            res.render('user-views/checkout', {
                user, cart, address, product: products,
                totalCartPrice: total, subTotal, discount
            })
        }
    } catch (error) {
        console.log(`ERROR IN GET CHECKOUT ERROR:${error}`)
    }
}

// post check Out page
const postChekOut = async (req, res) => {
    try {
        console.log(`data recieved on order`, req.body)

        let user = await User.findById(req.session.user_id)
        const product_ids = user.cart.cartItems.map((item) => {
            return item.ProductId
        })
        const products_details = user.cart.cartItems;
        console.log(products_details)
        let total_ = 0;
        let subTotal = 0;
        user.cart.cartItems.forEach((val) => {
            total_ += val.total;
            subTotal += val.total;
        })
        let discount = user.cart.discount;
        let total = total_ - discount
        console.log(req.body.paymentMethod + 'Pay mode')

        if (req.body.paymentMethod === 'Razorpay') {
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
                date: Date.now(),//
                productId: product_ids,
                userId: user._id,
                method: 'razorpay',
                status: 'Payment Pending',
                address: address,
                discount: user.cart.discount,
                userName: user.username,//
                productDetails: products_details,
                onlinePayment: {
                    status: 'initial',
                    isOnlinePayment: true,
                    orderId: razorpayOrder.id
                },
            })
            await newOrder.save()

            res.json({
                message: 'Razorpay gateway',
                order_id: razorpayOrder.id,
                amount: total * 100,
                currency: "INR",
                userName: user?.userName,
                userEmail: user.email,
                userMobile: user.mobile
            });

            console.log('paymethod razorpay selected', newOrder)

        }

        if (req.body.paymentStatus === 'Paid') {


            let findOrder = await Order.findOne({ 'onlinePayment.orderId': req.body.orderId })
            console.log('pending paymnet set to paid', findOrder);
            findOrder.onlinePayment.paymentId = req.body.paymentId;
            findOrder.onlinePayment.status = 'Paid';
            findOrder.status = 'Placed';
            findOrder.totalPrice = total
            findOrder.save();

            //manage the stock
            for (let item of findOrder.productDetails) {
                await Product.updateOne(
                    { _id: item.ProductId }, // Find the product by its ProductId
                    { $inc: { quantity: -item.quantity } } // Decrease the quantity using $inc
                );
            }
            //clear cart
            user.cart = {};
            user.save()
            console.log('pending paymnet set to paid', findOrder);
            res.json({ orderId: findOrder.orderID })
        }

        if (req.body.paymentStatus === 'Pending') {

            console.log('oid', req.body.orderId)
            let findOrder = await Order.findOne({ 'onlinePayment.orderId': req.body.orderId })
            findOrder.onlinePayment.status = 'Pending';
            findOrder.save();
            console.log('pending paymnet set to paid', findOrder);
            res.json({ orderId: findOrder.orderID })

        }


        if (req.body.paymentMethod === 'cod') {

            let orderId = generateOderId();
            let addressId = req.body.address
            let address = user.address.find((item) => {
                return item._id.toString() === addressId.toString()
            })
            console.log('address finded ', address)

            //manage the stock
            for (let item of products_details) {
                await Product.updateOne(
                    { _id: item.ProductId }, // Find the product by its ProductId
                    { $inc: { quantity: -item.quantity } } // Decrease the quantity using $inc
                );

            }

            let newOrder = new Order({
                orderID: orderId,
                totalPrice: total,
                date: Date.now(),//
                productId: product_ids,
                userId: user._id,
                method: 'cod',
                status: 'Placed',
                address: address,
                discount: user.cart.discount,
                userName: user.username,//
                productDetails: products_details,
            })
            await newOrder.save()

            //clear cart
            user.cart = {};
            user.save()
            res.json({ orderId: orderId, paymentCod: true })
            console.log('new oder saved usnig cod ', newOrder);

            console.log('paymethod cod')

        }

    } catch (error) {
        console.log(`ERROR IN POST ORDER , ERROR:${error}`)
    }
}


// get delete order
const deleteOrder = async (req, res) => {
    try {
        let id = req.query.id;
        let deleteOrder = await Order.findOneAndUpdate({ _id: id }, {
            $set: { isDeleted: true }
        });
        const alertMessage = {
            type: 'success', // Can be 'success', 'error', 'warning', or 'info'
            message: 'Order Deleted'
        };
        req.session.alertMessage = alertMessage;
        console.log('deleted', deleteOrder);
        res.redirect('/profile')
    } catch (error) {
        console.log(`ERROR IN DELETING ORDER, ERROR:${error}`)
    }
}

//pay on order page for failed  payment
const payOnOderPage = async (req, res) => {
    try {
        console.log(req.body)
        const orderId = req.body.orderId || false;
        console.log(orderId)
        const user = await User.findById(req.session.user_id);

        let total_ = 0;
        let subTotal = 0;
        user.cart.cartItems.forEach((val) => {
            total_ += val.total;
            subTotal += val.total;
        })
        let discount = user.cart.discount;
        let total = total_ - discount

        if (orderId) {
            const order = await Order.findById(orderId);
            console.log(order)
            res.json({
                message: 'Razorpay gateway',
                order_id: order.onlinePayment.orderId,
                amount: total * 100,
                currency: "INR",
                userName: user?.userName,
                userEmail: user.email,
                userMobile: user?.mobile,
                isInetiated: true,
            });
        }
        if (req.body.paymentStatus === 'Paid') {
            console.log('here')
            let findOrder = await Order.findOne({ 'onlinePayment.orderId': req.body.payment_orderId })
            console.log('pending paymnet set to paid', findOrder);
            findOrder.onlinePayment.paymentId = req.body.paymentId;
            findOrder.onlinePayment.status = 'Paid';
            findOrder.status = 'Placed';
            findOrder.totalPrice = total
            findOrder.save();
            console.log('pending paymnet set to paid', findOrder);

            //manage the stock
            for (let item of findOrder.productDetails) {
                await Product.updateOne(
                    { _id: item.ProductId }, // Find the product by its ProductId
                    { $inc: { quantity: -item.quantity } } // Decrease the quantity using $inc
                );
            }
            //clear cart
            user.cart = {};
            user.save()
            res.json({ orderId: findOrder.orderID })
        }

    } catch (error) {
        console.log('Error in Pay on order page ', error)
    }
}


//Generate Invoice
const generateInvoicePDF = async (orderDetails) => {
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
        doc.text(`Customer: ${orderDetails.userName}`);
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
            doc.text(`$${product.total}`, col3, rowTop, { width: 100, align: 'left' });
            doc.text(`$${product.total}`, col4, rowTop, { width: 100, align: 'left' });
        });

        doc.moveDown();
        doc.moveDown();

        // Summary Section
        doc.fontSize(12);
        doc.text(`Total Price: $${orderDetails.totalPrice}`);
        doc.text(`Discount: $${orderDetails.discount}`);
        doc.text(`Shipping Charge: $${orderDetails.shippingCharge}`);
        doc.text(`Grand Total: $${orderDetails.totalPrice - orderDetails.discount + orderDetails.shippingCharge}`);

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
        let alertMessage;
        let user = await User.findById(req.session.user_id);
        let orderId = req.query.id
        let suggestedProducts = await Product.find().limit(4);
        res.render('user-views/orderSuccess', { orderId, product: suggestedProducts, alertMessage })
        req.session.alertMessage = null;

    } catch (error) {
        console.log(`ERROR IN GET ORDER SUCCRSS PAGE, ERROR:${error}`)
    }
}

//invoice api cntrl
const invoice = async (req, res) => {
    try {
        let orderId = req.query.id;
        const order = await Order.find({ orderID: orderId });
        if (order.length > 0) {
            console.log('order found');
            console.log(order)
            let filePath = await generateInvoicePDF(order[0]);
            setTimeout(() => {
                res.download(filePath, 'invoice.pdf', (err) => {
                    if (err) {
                        console.log('Error downloading file', err);
                        res.status(500).send("Error downloading file");
                    } else {
                        fs.unlinkSync(filePath);
                    }
                });
            }, 1000);  // 1 second delay

        }
        else {
            console.log('no order found');
            res.status(500).json({ error: 'oops error' })
        }
    } catch (error) {
        res.status(500).json({ error: 'oops error in code' })
        console.log('eroor in invoice api cntrl err', error)
    }
}

//coupen Cntrl
const getCoupens = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id)
        let myCoupens = await Coupens.find({ isDeleted: false })
        console.log('mycoupens', myCoupens)
        res.render('user-views/coupens', { coupens: myCoupens, user })
    } catch (error) {
        console.log(`error while getting the coupens page Erro:${error}`)
    }
}

const applyCoupen = async (req, res) => {
    try {
        console.log('apply coupen api called', req.body.code);
        let user = await User.findById(req.session.user_id);
        let cartTotal = user.cart.cartItems.reduce((acc, cartItem) => {
            return acc + cartItem.total;
        }, 0);
        let isValid = false;
        let clietCode = req.body.code;
        let checkCode = await Coupens.findOne({ isDeleted: false, code: clietCode });
        console.log('check code', checkCode)
        if (checkCode) {
            isValid = true;
            let discountAmount = Math.floor((cartTotal * checkCode.percentage) / 100);
            let updatedTotal = cartTotal - discountAmount
            console.log('dis', discountAmount, ' ', 'total', updatedTotal)
            user.cart.discount = discountAmount;
            user.cart.coupen = clietCode;
            await user.save()

            res.status(200).json({
                msg: 'Code Apllyied', total: updatedTotal, discount: discountAmount,
                isValid
            })
        }
        else {
            res.status(200).json({
                msg: 'Code Not Valid', isValid
            })
        }

    } catch (error) {
        res.json({ msg: 'error' })
        console.log('Error while applying coupen Error', error)
    }
}
const cancelCoupen = async (req, res) => {
    try {
        console.log('cancel coupen api called', req.body.code);
        let user = await User.findById(req.session.user_id);
        let cartTotal = user.cart.cartItems.reduce((acc, cartItem) => {
            return acc + cartItem.total;
        }, 0);
        let isValid = false;
        let clietCode = req.body.code;
        let checkCode = await Coupens.findOne({ code: clietCode });
        console.log('check code', checkCode)
        if (checkCode) {
            isValid = true;
            let discountAmount = Math.floor((cartTotal * checkCode.percentage) / 100);
            let updatedTotal = cartTotal
            user.cart.discount = 0;
            user.cart.coupen = 'no';
            await user.save()

            res.status(200).json({
                msg: 'Coupen Removed', total: updatedTotal, discount: 0,
                isValid
            })
        }
        else {
            res.status(200).json({
                msg: 'Code Not Valid', isValid
            })
        }

    } catch (error) {
        res.json({ msg: 'error' })
        console.log('Error while cancelling coupen Error', error)
    }
}
module.exports = {
    getCart, postAddtoCart, putIncrementQnt, putDecrementQnt, deleteCartItem,
    getCheckOut, getOrderSuccess, postChekOut, deleteOrder, getCoupens, applyCoupen,
    cancelCoupen, invoice, payOnOderPage,
};