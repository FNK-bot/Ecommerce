const Product = require('../../models/product')
const Catagory = require('../../models/catagory')
const User = require('../../models/user')
const mongoose = require('mongoose');
const Order = require('../../models/order');



//Add to Cart

const postAddtoCart = async(req,res)=>{
    try {
        let user = await User.findById(req.session.user_id)
        let {product_id} = req.body;
        
        
        let findProduct = await Product.findById(product_id);
        if(findProduct && findProduct.quantity>=1){

            let alreadyIn = user.cart.find(cart_item => cart_item.ProductId  == product_id);
            if(alreadyIn){
                console.log(`${findProduct.name} the product is Already in the cart`)
                return  res.status(200).json({ message: `${findProduct.name} the product is Already in the cart`,messageType:'error' });
            }
            else{
                user.cart.push({
                    ProductId:findProduct._id,
                    quantity:1,
                    subTotal:findProduct.price,
                    total:findProduct.price,

                })
                await user.save()
                console.log(`${user.username} ----> ${findProduct.name} is added to cart`)
                return  res.status(200).json({ message: `${findProduct.name} is added to cart` ,messageType:'success'});
            }
            
        }
    } catch (error) {
        console.log(`Error in adding to cart Error:${error}`)
        res.status(500).json({ message: `Error while adding to cart` });
    }
}


//load cart items page

const getCart = async(req,res)=>{
    try {
        let user_id = req.session.user_id;
        let user = await User.findById(user_id);
        
        const product_ids = user.cart.map((item)=>{
            return item.ProductId
        })
        console.log('pr id list',product_ids)
        let products = await Product.find({_id:{$in:product_ids}})
        products = product_ids.map(id => products.find(product => product._id.toString() === id.toString()));
        console.log('pr list',products)
        console.log('cart Items',user.cart);
        
        let total = 0;
        let subTotal = 0;
        user.cart.forEach((val)=>{
            total += val.total;
            subTotal += val.subTotal;
        })

        res.render('user-views/cart',{cart:user.cart,product:products,total,subTotal})
    } catch (error) {
        console.log(`Error in get cart Error:${error}`)
    }
}

const putIncrementQnt = async(req,res)=>{
    try {
        console.log('put inc ',req.body)
        const sid =req.body.cid 
        const product_id = new mongoose.Types.ObjectId(req.body.cid );
        let qnt = parseInt(req.body.qnt);
        console.log(qnt,'qnt')
        let user = await User.findById(req.session.user_id)
        let product = await Product.findById(product_id)
        console.log('product',product)
        let cart = user.cart.find(item => item.ProductId == sid)
        console.log(cart)
        console.log(typeof(product_id))
        if(cart ){
            if(cart.quantity<product.quantity){
                const updated = await User.updateOne(
                    { _id: req.session.user_id, 'cart.ProductId': product_id },
                    {
                        $inc: {
                            'cart.$.quantity': 1, // Increment the quantity
                            'cart.$.subTotal': product.price, // Update the subtotal
                            'cart.$.total': product.price, // Update the subtotal
                        },
                    },
                    {new:true}
                );
                
                let singleTotal = (cart.quantity+1) * product.price;
                let cartQnt = cart.quantity +1;
                let total = 0;
                let subTotal=0;
                let UpdatedUser = await User.findById(req.session.user_id)
                console.log('updated cart',UpdatedUser.cart)
                UpdatedUser.cart.forEach((val)=>{
                    total += val.total;
                    subTotal += val.subTotal;
                })
                
                console.log(singleTotal,"sinlge total")
                console.log('qnt added')
               
                res.status(200).json({ message: `Quantity incremented` ,messageType:'success',
                    cartQnt,singleTotal,total,subTotal});
            }
            else{
                let singleTotal = (cart.quantity) * product.price;
                let cartQnt = cart.quantity ;
                let total = 0;
                let subTotal=0;
                
                user.cart.forEach((val)=>{
                    total += val.total;
                    subTotal += val.subTotal;
                })
                console.log('no more left to add')
                res.status(200).json({ message: `no more left to add`,messageType:'info',
                    cartQnt,singleTotal,total,subTotal});
            }
        }
       
        
    } catch (error) {
        console.log(`eroor while adding qnt Eroor;${error}`)
        res.status(500).json({ message: `Error while adding to cart` ,messageType:'error'});
    }
};
const putDecrementQnt = async(req,res)=>{
    try {
        
        console.log('put dec ',req.body)
        const sid =req.body.cid 
        const product_id = new mongoose.Types.ObjectId(req.body.cid );
        let qnt = parseInt(req.body.qnt);
        console.log(qnt,'qnt')
        let user = await User.findById(req.session.user_id)
        let product = await Product.findById(product_id)
        console.log('product',product)
        let cart = user.cart.find(item => item.ProductId == sid)
        console.log('cart og ',cart)
        console.log(typeof(product_id))
        if(cart ){
            if(cart.quantity>1){
                const updated = await User.updateOne(
                    { _id: req.session.user_id, 'cart.ProductId': product_id },
                    {
                        $inc: {
                            'cart.$.quantity': -1, // Increment the quantity
                            'cart.$.subTotal': -product.price, // Update the subtotal
                            'cart.$.total': -product.price, // Update the subtotal
                        },
                    },
                    {new:true}
                );
                let singleTotal = (cart.quantity-1) * product.price;
                let cartQnt = cart.quantity -1;
                let total = 0;
                let subTotal=0;
                
                let UpdatedUser = await User.findById(req.session.user_id)
                console.log('updated cart',UpdatedUser.cart)
                UpdatedUser.cart.forEach((val)=>{
                    total += val.total;
                    subTotal += val.subTotal;
                })
                console.log(singleTotal,"sinlge total")
                console.log('qnt decremented')
               
                res.status(200).json({ message: `Quantity decremented` ,messageType:'success',
                    cartQnt,singleTotal,total,subTotal});
            }
            else{
                let singleTotal = (cart.quantity) * product.price;
                let cartQnt = cart.quantity ;
                let total = 0;
                let subTotal=0;
                user.cart.forEach((val)=>{
                    total += val.total;
                    subTotal += val.subTotal;
                })
                console.log('Minimum 1 required or you can delete')
                res.status(200).json({ message: `Minimum 1 required or you can delete`,messageType:'info',
                    cartQnt,singleTotal,total,subTotal});
            }
        }
       
        
    } catch (error) {
        console.log(`eroor while removing qnt Eroor;${error}`)
        res.status(500).json({ message: `Error while adding to cart` });
    }
};

//delete cart item from cart
const deleteCartItem = async(req,res)=>{
    try {
        let id = req.body.id;
        let user = await User.findById(req.session.user_id)
        let cart =  user.cart.findIndex(item => item.ProductId == id);
        if(cart){
            // If the item is found, remove it from the array
            user.cart.splice(cart, 1);
            user.markModified('cart');
            await user.save();
            res.redirect('/cart')
            
        }

    } catch (error) {
        console.log(`eroor while deleting item  Eroor;${error}`)
        res.status(500).json({ message: `Error while adding to cart` });   
    }
}

// checkout

const getCheckOut = async(req,res)=>{
    try {
        let user = await User.findById(req.session.user_id)
        console.log('check out user',user)
        
        const product_ids = user.cart.map((item)=>{
            return item.ProductId
        })
        console.log('pr id list',product_ids)
        let products = await Product.find({_id:{$in:product_ids}})
        products = product_ids.map(id => products.find(product => product._id.toString() === id.toString()));
        console.log('pr list',products)

        let cart = user.cart;
        let address = user.address;
        let total = 0;
        let subTotal=0;
        cart.forEach((val)=>{
                    total += val.total;
                    subTotal += val.subTotal;
                })

        res.render('user-views/checkout',{user,cart,address,product:products,
            totalCartPrice:total,subTotal
        })
    } catch (error) {
        console.log(`ERROR IN GET CHECKOUT ERROR:${error}`)
    }
}


//generte oderId
function generateOderId() {
    var digits = "1234567890";
    var otp = "";
    for (i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}
const postChekOut = async (req,res)=>{
    try {
        console.log(`data recieved on order`,req.body)
        let addressId = req.body.address;
        let user = await User.findById(req.session.user_id)
        console.log('check out post user',user)    
        let findAddress = user.address.id(addressId);
        console.log('address',findAddress);

        const product_ids = user.cart.map((item)=>{
            return item.ProductId
        })
        // console.log('pr id list',product_ids)
        let products = await Product.find({_id:{$in:product_ids}})
        products = product_ids.map(id => products.find(product => product._id.toString() === id.toString()));
        // console.log('pr list',products)
        // console.log('cart Items',user.cart);
        
        let orderId=generateOderId();
        let total = 0;
        let subTotal = 0;
        user.cart.forEach((val)=>{
            total += val.total;
            subTotal += val.subTotal;
        })
        let newOrder = new Order({
            orderID: orderId,
            totalPrice : total,
            date : Date.now(),
            productId: product_ids,
            userId:user._id,
            method:'cod',
            status:'Placed',
            addressId:addressId,
        })
        await newOrder.save()   

        console.log('new oder saved ',newOrder);
        let suggestedProducts = await Product.find().limit(4);
        res.render('user-views/orderSuccess',{orderId,product:suggestedProducts})

        res.status(200)
    } catch (error) {
        console.log(`ERROR IN GET ORDER SUCCRSS PAGE, ERROR:${error}`)   
    }
}

const getOrderSuccess = async (req,res)=>{
    try {
        console.log(`data recieved on order`,req.body)
    } catch (error) {
        console.log(`ERROR IN GET ORDER SUCCRSS PAGE, ERROR:${error}`)   
    }
}

const deleteOrder = async (req,res)=>{
    try {
        let id = req.qury.id;
        let deleteOrder = await Order.findByIdAndDelete(id);
        console.log('deleted',deleteOrder);
        res.redirect('/profile')
    } catch (error) {
        console.log(`ERROR IN DELETING ORDER, ERROR:${error}`)   
    }
}
module.exports = {getCart,postAddtoCart,putIncrementQnt,putDecrementQnt,deleteCartItem,getCheckOut,getOrderSuccess,postChekOut,deleteOrder};