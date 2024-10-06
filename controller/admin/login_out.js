const User = require('../../models/user')
const getlogIn = async (req, res) => {
    try {
        res.status(200)
        res.render('admin/login')
    } catch (error) {
        console.log('error in login')
    }
}
const logout = async (req, res) => {
    try {
        req.session.Admin = false;
        console.log('logout', req.session.Admin)
        res.redirect('/admin')


    } catch (error) {
        console.log('Error in logout function ', error);
    }
}
const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('email' + email);

        // const findAdmin = await User.findOne({ email, isAdmin: '1' });
        // console.log('admin data :', findAdmin);

        // if (email == 'farseennkbcr28@gmail.com'&& password == '123') {

        //     console.log('correct')
        //     req.session.Admin = true;

        //     res.redirect('/admin/')
        // } else {
        //     res.redirect('/admin/login')
        // }
        req.session.Admin = true;

        //for handling the req from diffrent url
        const redirectTo = req.session.returnTo || '/admin/';
        delete req.session.returnTo; // Clean up returnTo after redirect
        return res.redirect(redirectTo)
    } catch (error) {
        console.log('Error in post login function ', error);
    }
}

//register
const getSignup = async (req, res) => {
    try {
        res.status(200)
        res.render('admin/register')
    } catch (error) {
        console.log('error in signup')
    }
}
const postSignup = async (req, res) => {
    try {
        res.status(200)

        res.redirect('/admin/login')
    } catch (error) {
        console.log('error in signup')
    }
}
module.exports = { getlogIn, getSignup, logout, postLogin, postSignup };