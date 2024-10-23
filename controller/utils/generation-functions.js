const crypto = require('crypto');
const bcrypt = require('bcrypt');

function generateReferrelCode() {
    return crypto.randomBytes(4).toString('hex');
}

//generte Otp
function generateOtp() {
    let digits = "1234567890";
    let otp = "";
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

module.exports = {
    generateReferrelCode,
    generateOtp,
    generateHashedPassword
};