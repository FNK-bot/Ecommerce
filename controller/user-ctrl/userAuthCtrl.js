const User = require('../../models/user');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const { generateReferrelCode,
    generateOtp, generateHashedPassword } = require('../utils/generation-functions');


// setup node mailer
let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: process.env.USER_NAME,
        pass: process.env.PASSWORD,
    }
});




const getLogin = async (req, res) => {
    try {
        res.status(200);
        res.render('user-views/login', { message: null })
    } catch (error) {
        console.error('Error Get Login ', error);
        res.status(500).json({ message: 'Internal server Error' })
    }
}

const postLogin = async (req, res) => {
    try {
        res.status(200);

        let { email, password } = req.body;


        let userData = await User.findOne({ email });

        //validate User
        if (userData) {
            //check user is not Blocked
            if (!userData.isBlocked) {

                //Handle if user signed with google and no passaword set yet 
                if (userData.isGoogle && (!userData.password)) {
                    res.render('user-views/login', {
                        message: `Youre account is signedup with google please
                         login through google or register and set password or can set password with forgot password option` });
                }

                else {
                    // If password Matched
                    if (await userData.isPasswordMatched(password)) {


                        req.session.user_id = userData._id;
                        req.session.userAuth = true;

                        //for handling the req from diffrent url
                        const redirectTo = req.session.userReturnTo || '/';
                        delete req.session.userReturnTo; // Clean up returnTo after redirect
                        return res.redirect(redirectTo)

                    }
                    else {
                        res.render('user-views/login', { message: `Password is Wrong` });
                    }
                }
            }
            else {
                //Handle User Is Blocked
                res.render('user-views/login', { message: 'This Account is blocked by the Admin , contact at Eseenceofficial@gmail.com ' })
            }

        }
        else {
            //If no user Data Found with email
            res.render('user-views/login', { message: `User not Found Please Sign Up` });
        }

    } catch (error) {
        console.error('error occured in post Login', error);
        res.render('user-views/login', { message: 'Something Gone Wrong' })

    }
}

const getLogOut = (req, res) => {
    try {

        //delete user id from session 
        delete req.session.user_id
        req.session.userAuth = false;

        res.redirect('/');
    } catch (error) {
        console.error('error in logout error:', error)
    }
};

const getOtpPage = async (req, res) => {
    try {

        let email = req.session.email;

        //Handle Message needed for otp Page
        let message = req.session.otpMessage || null

        req.session.otpMessage = null;
        res.render('user-views/otp', { message, email })
    } catch (error) {
        console.error('Error Happend in Get otp ctrl', error);
        res.render('user-views/login', { message: 'Something Gone Wrong' })
    }
}

const resendOtp = async (req, res) => {
    try {

        let email = req.session.email || req.body.email

        let otp = generateOtp();

        req.session.OTP = otp;

        req.session.otpExpiresAt = Date.now() + 5 * 60 * 1000; // Set expiration time to 5 minutes


        //setting Mail Options
        let mailOptions = {
            from: process.env.USER_NAME,
            to: email,
            subject: 'Verify Your Account  ✔',
            text: `Your OTP is : ${otp} ,Only valid For 5 minuts`, // plain text body
            html: `<b>  <h4 >Your OTP  ${otp}</h4>    
                <br>  <a href="/otp">Click here</a></b>`, // html body
        };

        //Handling Send Mail with Node Mailer
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log('Node mailer Error :', error);
                req.session.otpMessage = 'Error Occured while sending New OTP'
                res.redirect('/otp')
            }
            res.status(200).json({ success: true })
        });

    } catch (error) {
        console.error('Error in Resend Oto cntrl Error', error)
        res.render('user-views/login', { message: 'Something Gone Wrong' })
    }
}

const postOtp = async (req, res) => {
    try {
        //handle Input from user
        const { one, two, three, four } = req.body;
        let formOtp = one + two + three + four;
        let numberOtp = parseInt(formOtp);

        //configure OTP variables
        let orgOtp = req.session.OTP;
        let otpExpiresAt = req.session.otpExpiresAt;


        //validate Expiry
        if (Date.now() > otpExpiresAt) {
            req.session.otpMessage = 'OTP has expired, please request a new one.';
            return res.redirect('/otp');
        }

        //check Otp Macthing
        if (orgOtp == numberOtp) {
            let { name, email, phone, password } = req.session.User;

            //Generate Hashed Pasword
            let hashedPassword = await generateHashedPassword(password)

            let newUser = new User({
                username: name,
                email: email,
                mobile: phone,
                password: hashedPassword,
                referrelCode: generateReferrelCode(),
            });
            await newUser.save()

            req.session.email = null;//manage session

            //referrel Handle
            let referrel = req.session.referrel;
            if (referrel) {
                let validateRefferel = await User.findOne({ referrelCode: referrel });
                if (validateRefferel) {
                    //find user 
                    let userData = await User.findOne({ email });
                    //add 25 to wallet
                    userData.wallet += 25;
                    userData.transactionHistory.push({
                        amount: 25
                    });
                    //store who reffered user by sharing referrel code
                    userData.referredBy = validateRefferel._id;
                    await userData.save();
                    let referredByName = validateRefferel.username;
                    req.session.alertMessage = {
                        type: 'success',
                        message: `You got ₹25 with refferl offer shared by ${referredByName} ,check your wallet`
                    }

                    //also add the refferd user reward
                    validateRefferel.wallet += 25;
                    validateRefferel.transactionHistory.push({
                        amount: 25
                    });
                    await validateRefferel.save();

                }
            };

            //Verified Logic
            req.session.user_id = newUser._id;
            req.session.userAuth = true;

            //for handling the req from diffrent url
            const redirectTo = req.session.userReturnTo || '/';
            delete req.session.userReturnTo; // Clean up returnTo after redirect
            return res.redirect(redirectTo)
        }
        else {
            req.session.otpMessage = 'You Entered Wrong OTP'
            return res.redirect('/otp')
        }

    } catch (error) {
        console.error('Post Otp Error :', error);
        res.render('user-views/login', { message: 'OTP ERROR PLESE TRY WITH GOOGLE' })
    }
}

// Register Loading Page
const getRegister = async (req, res) => {
    try {
        res.render('user-views/register', { message: null })
    } catch (error) {
        console.error('Get Register Error :', error);
        res.render('user-views/login', { message: 'some thing went wrong' })
    }
}

const postRegister = async (req, res) => {
    try {

        let { email, phone, name } = req.body;

        let message = null;

        //Fetch user 
        let isExist = await User.findOne({ email })

        //Validate user
        if (isExist) {
            //if user Exist
            message = `${email} already exists`;

            res.render('user-views/register', { message })
        }
        else {
            //If user Not Registered
            req.session.User = req.body;
            req.session.email = req.body.email

            //Handle Refferel offer Input
            req.session.referrel = req.body.referrel || null;

            //configure otp
            let otp = generateOtp();
            req.session.OTP = otp;
            req.session.otpExpiresAt = Date.now() + 5 * 60 * 1000; // Set expiration time to 5 minutes


            //Node Mailer Option Config
            let mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: 'Verify Your Account  ✔',
                text: `Your OTP is : ${otp} ,Only Valid for 5 minuts`, // plain text body
                html: `<b>  <h4 >Your OTP  ${otp}</h4>    
                <br>  <a href="/otp">Click here</a></b>`, // html body
            };
            //handle NodeMailer
            transporter.sendMail(mailOptions, function (error, info) {

                if (error) {
                    console.error('Node mailer Error :', error);

                    req.session.otpMessage = 'Error Occured while sending otp'
                    res.redirect('/otp')

                } else {
                    req.session.otpMessage = null
                    res.redirect('/otp')
                }
            });

        }

    } catch (error) {
        console.error('Post Register Error :', error);
        res.render('user-views/login', { message: 'Some thing went wrong' })
    }
}


//forgot password
const getForgotPassword = async (req, res) => {
    try {

        //Handle Alert Message
        let alertMessage = req.session.alertMessage;
        req.session.alertMessage = null;

        res.render('user-views/forgotPassword', { alertMessage })
    } catch (error) {
        console.error('Get Forgot Password Error :', error);
        res.render('user-views/login', { message: 'Some thing went wrong' })
    }
}

const postForgotPassword = async (req, res) => {
    try {

        let { email } = req.body;

        //validate email
        let checkEmail = await User.findOne({ email: email });

        //handle If Email is valid
        if (checkEmail) {

            let otpToken = generateOtp() // used generate unique Token
            req.session.resetToken = otpToken;

            let mailOptions = {
                from: process.env.USER_NAME,
                to: email,
                subject: 'Forgot Password',
                text: `Click link below to reset password`, // plain text body
                html: `<b>  <h4 >visit here </h4>    
                <br>  <a href="https://essenceecommerce.shop/resetPassword?tk=${otpToken}&@=${email}">Click here</a></b>`, // html body
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error('Node mailer Error :', error);
                    req.session.alertMessage = {
                        type: 'error',
                        message: 'some thing went wrong while sending Mail , try later'
                    }
                    res.redirect('/forgotPassword')
                } else {

                    req.session.alertMessage = {
                        type: 'success',
                        message: 'Reset Link Has Shared to Your Mail Please Check it'
                    }
                    res.redirect('/forgotPassword');
                }
            });
        }
        else {
            req.session.alertMessage = {
                type: 'error',
                message: 'Email is Not Registerd yet'
            }
            res.redirect('/forgotPassword');
        }


    } catch (error) {

        console.error('Post forgot password Error :', error);
        res.render('user-views/login', { message: 'Some thing went wrong' })
    }
}

//rest password
const getResetPassword = async (req, res) => {
    try {

        req.session.tokenFromUser = req.query.tk; //Token from query saving to session
        req.session.resetMail = req.query.for;//email from query saving to session

        //Handle Alert Message
        let alertMessage = req.session.alertMessage;
        req.session.alertMessage = null;

        res.render('user-views/resetPassword', { alertMessage })
    } catch (error) {
        console.error('Get Reset password Error :', error);
        res.render('user-views/login', { message: 'Some thing went wrong' })
    }
}

const postResetPassword = async (req, res) => {
    try {

        //Fetch Password from user input
        let conPass = req.body.conPass;

        //validate user Email
        let user = await User.findOne({ email: req.session.resetMail });

        //check email is valid and token is same in session
        if (user && (req.session.tokenFromUser == req.session.resetToken)) {

            let hashedPass = await generateHashedPassword(conPass);
            user.password = hashedPass;
            await user.save()

            res.redirect('/login');

        }
        else {
            req.session.alertMessage = {
                type: 'error',
                message: 'Invalid Link or Credentials'
            }
            res.redirect('/resetPassword')
        }
    } catch (error) {
        console.error('Post reset password Error :', error);
        res.render('user-views/login', { message: 'Some thing went wrong' })
    }
}


//google auth cntrl(cb)
const googleAuth = async (req, res) => {

    //handle callabck after user validated
    req.logIn(req.user, (err) => {

        //Handle Error 
        if (err) {
            return res.render('user-views/login', { message: 'Google Login failed ' });
        }

        //Else set Access to user 
        req.session.userAuth = true;
        req.session.user_id = req.user.id;

        //for handling the req from diffrent url
        const redirectTo = req.session.userReturnTo || '/';
        delete req.session.userReturnTo; // Clean up returnTo after redirect
        return res.redirect(redirectTo)
    });
}

module.exports = {
    getLogin, getOtpPage, getRegister, getForgotPassword, postForgotPassword, getResetPassword, postResetPassword,
    postRegister, postOtp, postLogin, getLogOut, googleAuth, resendOtp
};