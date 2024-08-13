const User = require('../../models/user')
 
const getAllUsers = async(req,res)=>{
    try {
        // // test user
        // let newuser = new User({
        //     username:'farseen',
        //     email:'fareseen',
        //     isBlocked:true
        // });
        // newuser.save()
        // // await User.deleteOne({username:'farseen'})
        res.status(200)
        let allUsers = await User.find();
        const itemsperpage = 6;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(allUsers.length / 5);
        const currentUsers = allUsers.slice(startindex,endindex);
        let message = `All Users list`
        res.render('admin/users',{users:currentUsers,totalpages,currentpage,message})
    } catch (error) {
        res.status(500)
        console.log('Error in get all users ',error)
    }
}
const blockUser = async(req,res)=>{
    try {
        let id = req.params.id;
        let user = await User.findByIdAndUpdate(id,{
            isBlocked:true,
        },{new:true});

        res.redirect('/admin/users')
    } catch (error) {
        console.log('Error in block user ',error)
    }
}

const unBlockUser = async(req,res)=>{
    try {
        let id = req.params.id;
        let user = await User.findByIdAndUpdate(id,{
            isBlocked:false,
        },{new:true});

        res.redirect('/admin/users')
    } catch (error) {
        console.log('Error in unblock user ',error)
    }
}
module.exports = {getAllUsers,blockUser,unBlockUser};