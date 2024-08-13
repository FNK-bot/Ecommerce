const Catogary = require('../../models/catagory')
const getAllCatagory = async(req,res)=>{
    try {

        res.status(200)
        const getAllCatogary = await Catogary.find();
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(getAllCatogary.length / 3);
        const currentproduct = getAllCatogary.slice(startindex,endindex);

        res.render('admin/catagorys', { catogary: currentproduct,totalpages,currentpage, })
        
    } catch (error) {
       console.log('error in Catagorys')
    }
}

//add catagary

const getAddCatagory = async(req,res)=>{
    try {
        res.status(200)
        res.render('admin/addCatagory')
    } catch (error) {
        console.log('error in Catagorys')
    }
}
const postAddCatagory = async(req,res)=>{
    try {
        const { name, discription } = req.body;
        console.log(req.body)
        console.log('file',req.file)
        if (!discription) {
            return res.status(400).send('Description is required');
        }

        const catogaryExist = await Catogary.findOne( {name} );

        if (catogaryExist) {
            res.send('Catagory already exist');}
        else{
            let image = null;
            if (req.file) {
                image = req.file.filename;
}
            const newCatogary = new Catogary({
                name: name, 
                discription,
                image,
            });
    
            await newCatogary.save();
    
            console.log('newCatogary:', newCatogary);}
            

        res.redirect('/admin/Catagorys')
    } catch (error) {
        console.log('error in post Catagorys '+error)
    }
}

//edit Catagory

const getEditCatagory = async(req,res)=>{
    try {
        
        const id = req.query.id;

        const user = await Catogary.findById(id)
       
        if (user) {
            res.render('admin/editCatagory', { user: user })
        } else {
            res.redirect('/admin/catogarys')

        }
    } catch (error) {
        console.log('error in Catagorys')
    }
}
const postEditCatagory =  async(req,res)=>{
    try {
        console.log('req.query',req.query)
        const id = req.query.id;
        console.log(id)
        const img = req.file ? req.file.filename : null; // Check if req.file is defined
        if (img) {
            await Catogary.findByIdAndUpdate(id, {
                name: req.body.name,
                discription: req.body.discription,
                image: req.file.filename
            }, { new: true })
       } else {
            await Catogary.findByIdAndUpdate(id, {
                name: req.body.name,
                discription: req.body.discription,

            }, { new: true })
        }

        res.redirect('/admin/Catagorys')
    } catch (error) {
        console.log('error in post Catagorys')
    }
}


const deleteCatagory = async (req,res)=>{
    try {
        console.log(req.query.id)
        const id = req.query.id;
        const deletedCatogary = await Catogary.findByIdAndDelete(id);
        console.log('Deleted catogary:', deletedCatogary);

        res.redirect('/admin/Catagorys');
    }
    catch(err){
        console.log('error in delete catagory',err)
    }
}
module.exports = {getAllCatagory,postEditCatagory,
    getAddCatagory,getEditCatagory,postAddCatagory,deleteCatagory};
