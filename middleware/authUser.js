const User = require('../models/user')


const isLogged = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            // Fetch the user details from the database
            const user = await User.findById({ _id: req.session.user_id }).lean();

            if (user) {
                if (user.isBlocked === false) {
                    return next(); // Proceed to the next middleware if not blocked
                } else {
                    return res.render('user-views/login', {
                        message: 'This account is blocked by the Admin. Contact us at Essenceofficial@gmail.com.'
                    });
                }
            } else {
                return res.render('user-views/login', {
                    message: 'User not found, please login again.'
                });
            }
        } else {
            // Store the requested URL for later use after login
            req.session.userReturnTo = req.originalUrl;

            return res.render('user-views/login', {
                message: 'You need to log in to continue shopping.'
            });
        }
    } catch (error) {
        console.error('Error during login check:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = isLogged