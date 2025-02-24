const { OAuth2Client } = require('google-auth-library');
const User = require('../../models/User');
const generateToken = require('../AuthService/authService');
const axios = require('axios');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const { getRegion } = require('../../utils/regions');
async function googleLogin(req, res) {
    const { id_token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { sub, email, name } = payload;

        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User({
                googleId: sub,
                username: name,
                email: email,
            });
            await user.save();
        }

        const token = generateToken(user);
        res.json({ token, userId: user._id, message: 'Login successful', user });
    } catch (error) {
        console.error("Error during Google login:", error);  // Log the error
        res.status(400).json({ message: 'Invalid Google token' });
    }
};

async function saveAdditionalInfo(req, res) {
    const { userId, gender, age, location } = req.body;
    const response = await axios.get('http://ip-api.com/json');

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.gender = gender;
        user.age = age;
        user.location = response.data.city;
        await user.save();

        const token = generateToken(user);
        res.json({ token, userId: user._id, message: 'Additional information saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

async function updateLocation(req, res) {
    const { userId } = req.body;
    try {
        const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IP_GEOLOCATION_API_KEY}`);
        const location = response.data.state_prov;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.location = location;
        await user.save();

        res.json({ message: 'Location updated successfully', location });
    } catch (error) {
        console.error("Error updating location:", error);  // Log the error
        res.status(500).json({ message: 'Server error' });
    }
};


// async function updateLocation(req, res) {
//     const { userId } = req.body;

//     try {
//         // Get user's real IP from the request headers
//         let userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//         // Some proxies return multiple IPs, so we take the first one
//         if (userIp.includes(',')) {
//             userIp = userIp.split(',')[0].trim();
//         }

//         // Call the geolocation API with the user's real IP
//         const response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${process.env.IP_GEOLOCATION_API_KEY}&ip=${userIp}`);
//         const location = response.data.state_prov;

//         let user = await User.findById(userId);
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         user.location = location;
//         await user.save();

//         res.json({ message: 'Location updated successfully', location, userIp });
//     } catch (error) {
//         console.error("Error updating location:", error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };
async function updatePlace(req, res) {
    const { userId, location } = req.body;
    const place = getRegion(location);

    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.place = place;
        await user.save();

        res.json({ message: 'Place updated successfully', place });
    } catch (error) {
        console.error("Error updating place:", error);  // Log the error
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    googleLogin,
    saveAdditionalInfo,
    updateLocation,
    updatePlace,
}