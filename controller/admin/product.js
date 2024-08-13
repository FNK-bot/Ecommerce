const Catagory = require('../../models/catagory');
const Product = require('../../models/product')

const getAllProduct = async(req,res)=>{
    try {
        const allProducts= await Product.find()
        // console.log('All products',allProducts)
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allProducts.length / 5);
        const currentproduct = allProducts.slice(startindex,endindex);
        console.log('Product id =',allProducts._id)
        console.log('current products',currentproduct);
        res.render('admin/products',{ product: currentproduct,totalpages,currentpage,message:''})

        // res.status(200)
        // res.render('admin/products')
    } catch (error) {
       console.log('error in products ',error)
    }
}

//add product

const getAddProduct = async(req,res)=>{
    try {
        res.status(200)
        console.log('')
        const allProducts = await Product.find();
        const getAllCatagory = await Catagory.find();
        res.render('admin/addProduct',{product:allProducts,category:getAllCatagory,message:''})
    } catch (error) {
        console.log('error in add products '+error)
    }
}
const postAddProduct = async(req,res)=>{
    try {
        res.status(200)
        console.log('body ', req.body);
        message = '';
        console.log('req.file ',req.files)
        checkProductExist = await Product.findOne({name:req.body.name});
        console.log('check product exist',checkProductExist)
        if(checkProductExist){
            message = 'Product already exist';
            console.log(message)
            res.redirect('/admin/products')
        }
        else{
            
            const images = [];
            if (req.files && req.files.length > 0) {
                for (let i = 0; i < req.files.length; i++) {
                    images.push(req.files[i].filename);
                    console.log(req.files[i].filename)
                }
            }
            const newProduct = new Product({
                name:req.body.name,
                discription:req.body.discription,
                brand:req.body.brand,
                offerPrice:req.body.offerPrice,
                price:req.body.price,
                categary:req.body.categary,
                quantity:req.body.quantity,
                size:req.body.size,
                color:req.body.color,
                images:images,

            })
            if(await newProduct.save()){
                console.log('done')
                console.log(newProduct);
                res.redirect('/admin/products')
            }
            console.log('errr')
            

        }
        
    } catch (error) {
        console.log('error in post products '+ error )
    }
}

//edit product

const getEditProduct = async(req,res)=>{
    try {
        res.status(200) 
        console.log('Get edit product control')
        const id = req.params.id;
        editProduct = await Product.findById(id);
        const getAllCatagory = await Catagory.find();
        let message =''
        res.render('admin/editProduct',{product:editProduct,category:getAllCatagory})
    } catch (error) {
        console.log('error in products')
    }
}
const postEditProduct =  async(req,res)=>{
    try {
        res.status(200)
        console.log('Post edit product control')
        const id = req.params.id;
        let images = [];
        let editProduct;
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                images.push(req.files[i].filename);
            }
        }
        else{
            images = null;
        }
        if(images){
            console.log('images'+images )
            editProduct = await Product.findByIdAndUpdate(id,{
            name:req.body.name,
            discription:req.body.discription,
            brand:req.body.brand,
            offerPrice:req.body.offerPrice, 
            price:req.body.price,
            categary:req.body.categary,
            quantity:req.body.quantity,
            size:req.body.size,
            color:req.body.color,
            images:images,

        },{new:true});
        }
        else{
            console.log('No images' )
            editProduct = await Product.findByIdAndUpdate(id,{
            name:req.body.name,
            discription:req.body.discription,
            brand:req.body.brand,
            offerPrice:req.body.offerPrice,
            price:req.body.price,
            categary:req.body.categary,
            quantity:req.body.quantity,
            size:req.body.size,
            color:req.body.color,

        },{new:true});
        }
        message = `${editProduct.name} product edited successfully`
        console.log(message)
        res.redirect('/admin/products')
    } catch (error) {
        console.log('error in edit products'+error)
    }
}

// delete

const deleteProduct = async (req,res)=>{
    try {
        console.log('delete product control')
        console.log(req.params.id)
        const id = req.params.id;
        const deletedProduct = await Product.findByIdAndDelete(id);
        console.log('Deleted product:', deletedProduct);
        messege = `${deletedProduct.name} product is deleted succesfully`
        res.redirect('/admin/products');
    }
    catch(err){
        console.log('error in delete product',err)
    }
}
module.exports = {getAllProduct,postEditProduct,
    getAddProduct,getEditProduct,postAddProduct,deleteProduct};
