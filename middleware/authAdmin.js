
const isLogged = ((req, res, next) => {

  console.log('loged in', req.session.Admin)
  if (req.session.Admin == true) {
    next()

  } else {
    //for handling the req from diffrent url
    req.session.returnTo = req.originalUrl
    res.redirect('/admin/login')
  }
})
module.exports = isLogged