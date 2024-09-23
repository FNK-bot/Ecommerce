const User = require('../../models/user');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');
dotenv.config();

// setup node mailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: process.env.USER_NAME,
        pass: process.env.PASSWORD,
    }
});

//generte Otp
function generateOtp() {
    var digits = "1234567890";
    var otp = "";
    for (i = 0; i < 4; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
}

// generate Hashed password using bcryt
const generateHashedPassword = async (password) => {
    const saltRounds = 10; // Number of salt rounds
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};



const getLogin = async (req, res) => {
    try {
        res.status(200);
        // req.session.previousUrl = req.originalUrl =='/login' ? '/' :req.originalUrl;
        // console.log(`Previous Url :${req.session.previousUrl}`)
        res.render('user-views/login', { message: null })
    } catch (error) {
        res.render('error')
    }
}
const postLogin = async (req, res) => {
    try {
        // const url = req.session.previousUrl ? req.session.previousUrl : '/';
        // console.log(`Previous Url :${url}`)
        res.status(200);
        console.log('body', req.body)
        let { email, password } = req.body;
        let referrel = req.body.referrel || null;
        let userData = await User.findOne({ email });
        if (userData) {
            if (!userData.isBlocked) {
                if (userData.isGoogle && (!userData.password)) {
                    res.render('user-views/login', { message: `Youre account is signedup with google please login through google or register and set password or can set password with forgot password option` });
                }

                else {

                    if (await userData.isPasswordMatched(password)) {
                        //referrel 
                        if (referrel) {
                            let validateRefferel = await User.findOne({ email: referrel });
                            console.log('referrel ', validateRefferel.username)
                            if (validateRefferel) {
                                userData.wallet += 25;
                                userData.transactionHistory.push({
                                    amount: 25
                                })
                                userData.save()
                                req.session.mType = 'success'
                                req.session.mContent = 'You got ₹25 with refferl offer,check your wallet'
                            }
                        }

                        req.session.user_id = userData._id;
                        req.session.userAuth = true;
                        res.redirect('/')
                    }
                    else {
                        res.render('user-views/login', { message: `Password is Wrong` });
                    }
                }
            }
            else {
                res.render('user-views/login', { message: 'This Account is blocked by the Admin , contact at Eseenceofficial@gmail.com ' })
            }

        }

        else {
            res.render('user-views/login', { message: `User not Found Please Sign Up` });
        }

    } catch (error) {
        console.log('error occured in post Login', error);
        res.render('user-views/login', { message: error })

    }
}
const getLogOut = (req, res) => {
    try {
        res.status(200);
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.log('error in logout error:', error)
    }
};
const getOtpPage = async (req, res) => {
    try {
        res.status(200);
        let email = req.session.email ? req.session.email : false;
        res.render('user-views/otp', { message: null, email })
    } catch (error) {
        res.render('error while getting otp page Error: ', error)
    }
}

const postOtp = async (req, res) => {
    let email = req.session.email;
    console.log('post otp email :', email)
    try {
        const { one, two, three, four } = req.body;
        let formOtp = one + two + three + four;
        let numberOtp = parseInt(formOtp);
        let orgOtp = req.session.OTP;
        console.log('otp input', numberOtp);

        if (numberOtp == orgOtp) {
            console.log(req.session.User);
            let { name, email, phone, password } = req.session.User;
            let hashedPassword = await generateHashedPassword(password)
            console.log('email verified');
            let newUser = new User({
                username: name,
                email: email,
                mobile: phone,
                password: hashedPassword,
            });
            await newUser.save()
            req.session.user_id = newUser._id;
            req.session.userAuth = true;
            res.redirect('/');
        }
        else {
            console.log(email);
            res.render('user-views/otp', { message: 'Invalid OTP', email })
        }
    } catch (error) {
        res.render('user-views/login', { message: 'OTP ERROR PLESE TRY WITH GOOGLE' })
        console.log('Post Otp Error :', error);
    }
}

const getRegister = async (req, res) => {
    try {
        res.status(200);
        res.render('user-views/register', { message: null })
    } catch (error) {

    }
}
const postRegister = async (req, res) => {
    try {
        res.status(200);
        let { email, phone, name } = req.body;
        console.log(req.body)
        let message = null;
        let isExist = await User.findOne({ email })
        if (isExist) {
            message = `${email} already exists`;
            console.log(message)
            // res.send("alert('email already exist '); window.location.href = '/register'; ");
            res.render('user-views/register', { message })
        }
        else {
            req.session.User = req.body;
            let otp = generateOtp();
            req.session.OTP = otp;
            let mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: 'Verify Your Account  ✔',
                text: `Your OTP is : ${otp}`, // plain text body
                html: `<b>  <h4 >Your OTP  ${otp}</h4>    
                <br>  <a href="/otp">Click here</a></b>`, // html body
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('Node mailer Error :', error);
                    res.render('user-views/register', { message: 'Error Occured in senting otp' })
                } else {
                    console.log('Email sent: ' + info.response);
                    console.log('generated otp', otp);
                    res.render('user-views/otp', { email, message: null })
                }
            });

        }

    } catch (error) {
        console.log('Post register Error :', error);
    }
}


//forgot password
const getForgotPassword = async (req, res) => {
    try {
        res.status(200);
        let alertMessage = {
            type: req.session.mType,
            message: req.session.mContent,
        }
        req.session.mType = ' ';
        req.session.mContent = " ";
        res.render('user-views/forgotPassword', { alertMessage })
    } catch (error) {

        console.log('get  forgot mail Error :', error);
    }
}

const postForgotPassword = async (req, res) => {
    try {
        res.status(200);
        let { email } = req.body;
        let checkEmail = await User.findOne({ email: email });
        if (checkEmail) {

            let otpToken = generateOtp()
            req.session.resetToken = otpToken;
            console.log(email)
            let mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: 'Forgot Password',
                text: `Click link below to reset password`, // plain text body
                html: `<b>  <h4 >visit here </h4>    
                <br>  <a href="http://localhost:3000/resetPassword?tk=${otpToken}&@=${email}">Click here</a></b>`, // html body
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('Node mailer Error :', error);
                    req.session.mType = 'error';
                    req.session.mContent = "please try after some time ";
                    res.redirect('/forgotPassword')
                } else {
                    console.log('Email sent: ' + info.response);
                    console.log(`link generated http://localhost:3000/resetPassword?tk=${otpToken}&for=${email}`)
                    req.session.mType = 'success';
                    req.session.mContent = "Reset Link is shared in the mail ";
                    res.redirect('/forgotPassword');
                }
            });
        }
        else {
            req.session.mType = 'error';
            req.session.mContent = "Email is not Registered Yet ";
            res.redirect('/forgotPassword');
        }


    } catch (error) {

        console.log('Post forgoy mail Error :', error);
    }
}

//rest password
const getResetPassword = async (req, res) => {
    try {
        res.status(200);
        req.session.tokenFromUser = req.query.tk;
        req.session.resetMail = req.query.for;
        let alertMessage = {
            type: req.session.mType,
            message: req.session.mContent,
        }
        req.session.mType = ' ';
        req.session.mContent = " ";
        res.render('user-views/resetPassword', { alertMessage })
    } catch (error) {

        console.log('get reset mail Error :', error);
    }
}

const postResetPassword = async (req, res) => {
    try {
        res.status(200);
        console.log('Reset Password post body', req.body)
        let conPass = req.body.conPass;
        let user = await User.findOne({ email: req.session.resetMail });
        if (user && (req.session.tokenFromUser == req.session.resetToken)) {
            console.log(user.username)
            let hashedPass = await generateHashedPassword(conPass);
            user.password = hashedPass;
            await user.save()
            res.redirect('/login');

        }
        else {
            req.session.mType = 'error';
            req.session.mContent = "Youre Token is incorrect ,Please click Resend the link ";
            res.redirect('/resetPassword')
        }
    } catch (error) {

        console.log('Post reset mail Error :', error);
    }
}


//google auth cntrl
const googleAuth = async (req, res) => {
    // This callback will be called after the user is authenticated by Passport
    req.logIn(req.user, (err) => {
        if (err) {
            console.log('Login failed')
            return res.render('user-views/login', { message: 'Login failed' });
        }
        console.log('google authenticated  id', req.user.id);
        req.session.userAuth = true;
        req.session.user_id = req.user.id;  // Save user ID in session
        return res.redirect('/');
    });
}

module.exports = {
    getLogin, getOtpPage, getRegister, getForgotPassword, postForgotPassword, getResetPassword, postResetPassword,
    postRegister, postOtp, postLogin, getLogOut, googleAuth
};