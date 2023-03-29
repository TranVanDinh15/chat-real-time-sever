const jwt = require('jsonwebtoken');

const generateJWT = (user) => {
    return jwt.sign({ _id: user._id }, process.env.ECOMMECE_SCRET, {
        expiresIn: '30d',
    });
};
module.exports = generateJWT;
