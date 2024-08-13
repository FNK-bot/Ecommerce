const getDashboard = async(req,res)=>{
    try {
        res.status(200)
        res.render('admin/dashboard')
    } catch (error) {
        res.status(500).end()
        res.render('error')
    }
}
module.exports = getDashboard;