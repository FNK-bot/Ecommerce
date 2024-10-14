
const isLogged = ((req, res, next) => {

  if (req.session.Admin == true) {

    next()
  } else {

    //for handling the req from diffrent url
    req.session.returnTo = req.originalUrl
    res.redirect('/admin/login')
  }
})
module.exports = isLogged