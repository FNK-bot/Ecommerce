
const isLogged=((req,res,next)=>{
  
  console.log('loged in',req.session.Admin)
    if(req.session.Admin == true){
      next()
    
    }else{
        res.redirect('/admin/login')
    }
})
module.exports = isLogged