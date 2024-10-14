const passport = require('passport');
const googleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const dotenv = require('dotenv');
dotenv.config();

passport.use(new googleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: '/google/callback',
},
    async (accToken, refToken, profile, cb) => {
        try {
            let user = await User.findOne({ googleID: profile.id });
            if (user) {

                return cb(null, user, {
                    message: 'User Already Exist'
                })
            }
            else {
                let checkEmailExist = await User.findOne({ email: profile.emails[0].value })

                if (!checkEmailExist) {

                    let newUser = await User.create({
                        username: profile.displayName,
                        email: profile.emails[0].value,
                        googleID: profile.id,
                        isGoogle: true,
                    })

                    return cb(null, newUser)
                }
                else {


                    if (!checkEmailExist.googleID) {
                        await User.findOneAndUpdate(
                            { email: profile.emails[0].value },
                            { $set: { googleID: profile.id, isGoogle: true } },
                            { new: true }
                        );

                    }
                    return cb(null, checkEmailExist, { message: 'User Email Already exist' })
                }

            }
        } catch (error) {
            console.error(`/googele auth/ :error => ${error}`)
            return cb(error, null)
        }
    }
));

passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
    User.findById(id).then((user) => {
        cb(null, user)
    })
        .catch((err) => {
            cb(err, null)
        })
})

module.exports = passport;