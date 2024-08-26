const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const mongoose = require('mongoose');
const Order = require('../../models/order');
const Razorpay = require('razorpay');
const Coupens = require('../../models/coupen')
const dotenv = require('dotenv');
dotenv.config();

//razorpay instance
let instance = new Razorpay({
    key_id: process.env.razorpay_id,
    key_secret: process.env.razorpay_secret,
});

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

        let total = user.cart.total;
        let subTotal = user.cart.subtotal;
        console.log('subTotal ', subTotal)
        let discount = user.cart.discount;
        let coupen = user.cart.coupen;
        console.log('coupen get cart', coupen)
        res.render('user-views/cart', { cart: user.cart.cartItems, product: products, total, subTotal, discount, coupen })
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

                res.status(200).json({
                    message: `Quantity incremented`, messageType: 'success',
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
                console.log('no more left to add')
                res.status(200).json({
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
                console.log('updated cart', UpdatedUser.cart.cartItems)
                UpdatedUser.cart.cartItems.forEach((val) => {
                    total += val.total;
                    subTotal += val.total;
                })
                console.log(singleTotal, "sinlge total")
                console.log('qnt decremented')

                res.status(200).json({
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
                res.status(200).json({
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
        let id = req.body.id;
        let user = await User.findById(req.session.user_id)
        let cart = user.cart.cartItems.findIndex(item => item.ProductId == id);
        if (cart) {
            // If the item is found, remove it from the array
            user.cart.cartItems.splice(cart, 1);
            user.markModified('cart');
            await user.save();
            res.redirect('/cart')

        }

    } catch (error) {
        console.log(`eroor while deleting item  Eroor;${error}`)
        res.status(500).json({ message: `Error while adding to cart` });
    }
}

// checkout Ctrl
const getCheckOut = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id)
        console.log('check out user', user)

        const product_ids = user.cart.cartItems.map((item) => {
            return item.ProductId
        })
        console.log('pr id list', product_ids)
        let products = await Product.find({ _id: { $in: product_ids } })
        products = product_ids.map(id => products.find(product => product._id.toString() === id.toString()));
        console.log('pr list', products)

        let cart = user.cart.cartItems;
        let address = user.address;
        let total = user.cart.total;
        let subTotal = user.cart.subtotal;
        let discount = user.cart.discount;
        // cart.forEach((val) => {
        //     total += val.total;
        //     subTotal += val.subTotal;
        // })

        res.render('user-views/checkout', {
            user, cart, address, product: products,
            totalCartPrice: total, subTotal, discount
        })
    } catch (error) {
        console.log(`ERROR IN GET CHECKOUT ERROR:${error}`)
    }
}

//checkout post
const postChekOut = async (req, res) => {
    try {
        console.log(`data recieved on order`, req.body)

        let user = await User.findById(req.session.user_id)
        const product_ids = user.cart.cartItems.map((item) => {
            return item.ProductId
        })
        let total = user.cart.total

        console.log(req.body.paymentMethod + 'Pay mode')

        if (req.body.onlinePayment == true) {
            let orderId = generateOderId();
            let addressId = req.body.address
            let address = user.address.find((item) => {
                return item._id.toString() === addressId.toString()
            })
            let newOrder = new Order({
                orderID: orderId,
                totalPrice: total,
                date: Date.now(),
                productId: product_ids,
                userId: user._id,
                method: 'razorpay',
                status: 'Placed',
                address: address,
                discount: user.cart.discount,
                userName: user.username,
            })
            await newOrder.save()
            console.log('new oder saved using razorpay', newOrder);
            res.json({ orderId: orderId })
        }

        if (req.body.paymentMethod === 'Razorpay') {
            const razorpayOrder = await instance.orders.create({
                amount: total * 100, // Razorpay accepts amount in paise, hence multiply by 100
                currency: "INR",
                receipt: `receipt_${Date.now()}`,
            });

            res.json({
                message: 'Razorpay gateway',
                order_id: razorpayOrder.id,
                amount: total * 100,
                currency: "INR",
                userName: user.userName,
                userEmail: user.email,
                userMobile: user.mobile
            });

            console.log('paymethod razorpay')

        }
        if (req.body.paymentMethod === 'cod') {

            let orderId = generateOderId();
            let addressId = req.body.address
            let address = user.address.find((item) => {
                return item._id.toString() === addressId.toString()
            })
            console.log('address finded ', address)
            let newOrder = new Order({
                orderID: orderId,
                totalPrice: total,
                date: Date.now(),
                productId: product_ids,
                userId: user._id,
                method: 'cod',
                status: 'Placed',
                address: address,
                discount: user.cart.discount,
                userName: user.username,
            })
            await newOrder.save()

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
        let id = req.qury.id;
        let deleteOrder = await Order.findByIdAndDelete(id);
        console.log('deleted', deleteOrder);
        res.redirect('/profile')
    } catch (error) {
        console.log(`ERROR IN DELETING ORDER, ERROR:${error}`)
    }
}

// get Order success Page 
const getOrderSuccess = async (req, res) => {
    try {
        let alertMessage;
        let user = await User.findById(req.session.user_id);
        let orderId = req.query.id
        let suggestedProducts = await Product.find().limit(4);
        let findCoupen = await Coupens.findOne({ code: 'la5dkxnadw' });
        if (user.coupens.length == 0) {
            user.coupens.push({
                coupenId: findCoupen._id
            });
            await user.save()
            console.log('user coupen pushed')
            alertMessage = {
                type: 'success', // Can be 'success', 'error', 'warning', or 'info'
                message: 'New Coupen Added'
            };
        }
        else {
            console.log('coupen is there')
        }
        res.render('user-views/orderSuccess', { orderId, product: suggestedProducts, alertMessage })
        req.session.alertMessage = null;

    } catch (error) {
        console.log(`ERROR IN GET ORDER SUCCRSS PAGE, ERROR:${error}`)
    }
}

//coupen Cntrl
const getCoupens = async (req, res) => {
    try {
        let user = await User.findById(req.session.user_id);
        console.log('coupen ids', user.coupens)
        let myCoupenId = user.coupens.map((coupen) => coupen.coupenId)
        let myCoupens = await Coupens.find({ _id: { $in: myCoupenId } })
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
        let checkCode = await Coupens.findOne({ code: clietCode });
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
    cancelCoupen
};