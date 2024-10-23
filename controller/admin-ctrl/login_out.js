const User = require('../../models/user')
const dotenv = require('dotenv');
dotenv.config();

const getlogIn = async (req, res) => {
    try {
        res.status(200);

        //Handle Message (for Frontend ) 
        let message = req.session.adminErrorMessage || null;
        delete req.session.adminErrorMessage

        res.render('admin/login', { message })
    } catch (error) {
        console.error('error in login', error)
    }
}

const logout = async (req, res) => {
    try {
        req.session.Admin = false;

        res.redirect('/admin')
    } catch (error) {
        console.error('Error in logout ', error);
        res.render('admin/login', { message: 'something went wrong' })
    }
}

const postLogIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        //if Credential Matched
        if (email == process.env.adminEmail && password == process.env.adminPassword) {

            req.session.Admin = true;

            //for handling the req from diffrent url
            const redirectTo = req.session.returnTo || '/admin/';
            delete req.session.returnTo; // Clean up returnTo after redirect
            return res.redirect(redirectTo)

        } else {
            req.session.adminErrorMessage = 'Wrong Credentials';
            return res.redirect('/admin/login')
        }

    } catch (error) {
        console.error('Error in Post login  ', error);
        res.render('admin/login', { message: 'something went wrong' })
    }
}

module.exports = { getlogIn, logout, postLogIn };