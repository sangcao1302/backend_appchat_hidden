// const jwt = require('jsonwebtoken');

// function generateToken(userId) {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '60d' });
// }

// module.exports = {
//     generateToken,
// };

const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '20d',
    });
};

module.exports = generateToken;