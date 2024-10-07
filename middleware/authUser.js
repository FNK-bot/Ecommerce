const User = require('../models/user')



const isLogged = ((req, res, next) => {

    if (req.session.user_id) {

        User.findById({ _id: req.session.user_id }).lean()
            .then((data) => {

                if (data?.isBlocked == false) {
                    console.log(`${data.username} has access -- from user Auth`)

                    next()
                } else {
                    res.render('user-views/login', { message: 'This Account is blocked by the Admin , contact at Eseenceofficial@gmail.com ' })
                }
            })
    } else {
        //for handling the req from diffrent url
        req.session.userReturnTo = req.originalUrl
        console.log('Return url', req.session.userReturnTo)
        res.render('user-views/login', { message: 'You need to login for continue shopping' });
    }
})
module.exports = isLogged