// const express = require('express');
// const router = express.Router();
// const { login } = require('../Login/Login');

// router.post('/login', login);

// module.exports = router

// const express = require('express');
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User');
// const generateToken = require('../AuthService/authService');

// const router = express.Router();
// const client = new OAuth2Client("856169255965-cljq70k845iulkcj31mgjqpp22gma6fi.apps.googleusercontent.com");

// router.post('/login', async (req, res) => {
//     const { id_token } = req.body;
//     console.log("Received Google ID Token:", id_token);  // Log the received token

//     try {
//         // Verify the Google ID token
//         const ticket = await client.verifyIdToken({
//             idToken: id_token,
//             audience: "856169255965-cljq70k845iulkcj31mgjqpp22gma6fi.apps.googleusercontent.com", // Make sure this matches the client ID
//         });

//         // Get the payload from the token
//         const payload = ticket.getPayload();
//         const { sub, email, name } = payload;
//         console.log("Google Payload:", payload); // Log the payload for debugging

//         // Check if the user already exists in the database
//         let user = await User.findOne({ googleId: sub });

//         // If user doesn't exist, create a new user
//         if (!user) {
//             user = new User({
//                 googleId: sub,
//                 username: name,
//                 email: email,
//             });
//             await user.save();
//         }

//         // Generate a JWT token
//         const token = generateToken(user);
//         console.log("Generated Token:", token); // Log the generated token

//         // Send the response with the token and user info
//         res.json({ token, userId: user._id, message: 'Login successful' });

//     } catch (error) {
//         console.error("Error during Google login:", error);  // Log the error
//         res.status(400).json({ message: 'Invalid Google token' });
//     }
// });


// module.exports = router;



// const express = require('express');
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User');
// const generateToken = require('../AuthService/authService');

// const router = express.Router();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         let user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid credentials' });
//         }

//         const token = generateToken(user);
//         res.json({ token, userId: user._id, message: 'Login successful' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// router.post('/auth/google', async (req, res) => {
//     const { id_token } = req.body;
//     try {
//         const ticket = await client.verifyIdToken({
//             idToken: id_token,
//             audience: process.env.GOOGLE_CLIENT_ID,
//         });
//         const payload = ticket.getPayload();
//         const { sub, email, name } = payload;

//         let user = await User.findOne({ googleId: sub });
//         if (!user) {

//             user =  new User({
//                 googleId: sub,
//                 username: name,
//                 email: email,
//             });
//             await user.save();
//         }

//         const token = generateToken(user);
//         res.json({ token, userId: user._id, message: 'Login successful', user });
//     } catch (error) {
//         console.error("Error during Google login:", error);  // Log the error
//         res.status(400).json({ message: 'Invalid Google token' });
//     }
// });

// router.post('/auth/google/additional-info', async (req, res) => {
//     const { userId, gender, age, location } = req.body;
//     try {
//         let user = await User.findById(userId);
//         if (!user) {
//             return res.status(400).json({ message: 'User not found' });
//         }

//         user.gender = gender;
//         user.age = age;
//         user.location = location;
//         await user.save();

//         const token = generateToken(user);
//         res.json({ token, userId: user._id, message: 'Additional information saved successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// module.exports = router;

const express = require('express');
const { googleLogin, saveAdditionalInfo, updateLocation, updatePlace } = require('../controller/Login/Login');

const router = express.Router();

router.post('/auth/google', googleLogin);
router.post('/auth/google/additional-info', saveAdditionalInfo);
router.post('/auth/update-location', updateLocation);
router.post('/auth/update-place', updatePlace);


module.exports = router;

// const express = require('express');
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User');
// const generateToken = require('../AuthService/authService');
// const axios = require('axios');

// const router = express.Router();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// async function getGoogleUserProfile(id_token, access_token) {
//     const ticket = await client.verifyIdToken({
//         idToken: id_token,
//         audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();
//     const { sub, email, name } = payload;

//     // Fetch additional profile information from Google People API
//     const peopleResponse = await axios.get(`https://people.googleapis.com/v1/people/me?personFields=genders,birthdays,addresses`, {
//         headers: {
//             Authorization: `Bearer ${access_token}`,
//         },
//     });

//     const profile = peopleResponse.data;
//     console.log("Google People API Response:", profile); // Log the response data

//     const gender = profile.genders ? profile.genders[0].value : null;
//     const age = profile.birthdays ? new Date().getFullYear() - new Date(profile.birthdays[0].date.year, profile.birthdays[0].date.month - 1, profile.birthdays[0].date.day).getFullYear() : null;
//     const ipResponse = await axios.get('http://ip-api.com/json');
//     const location = `${ipResponse.data.city}`;

//     return {
//         googleId: sub,
//         email: email,
//         name: name,
//         gender: gender,
//         age: age,
//         location: location,
//     };
// }

// router.post('/auth/google', async (req, res) => {
//     const { id_token, access_token } = req.body;
//     console.log("Received Google ID Token:", id_token);  // Log the received token
//     console.log("Received Google Access Token:", access_token);  // Log the received access token

//     try {
//         const googleUser = await getGoogleUserProfile(id_token, access_token);
//         console.log("Google User Profile:", googleUser); // Log the Google user profile

//         let user = await User.findOne({ googleId: googleUser.googleId });
//         if (!user) {
//             user = new User({
//                 googleId: googleUser.googleId,
//                 username: googleUser.name,
//                 email: googleUser.email,
//                 gender: googleUser.gender,
//                 age: googleUser.age,
//                 location: googleUser.location,
//             });
//             await user.save();
//         } else {
//             user.gender = googleUser.gender;
//             user.age = googleUser.age;
//             user.location = googleUser.location;
//             await user.save();
//         }

//         const token = generateToken(user);
//         console.log("Generated Token:", token); // Log the generated token

//         res.json({ token, userId: user._id, message: 'Login successful', user });
//     } catch (error) {
//         console.error("Error during Google login:", error);  // Log the error
//         res.status(400).json({ message: 'Invalid Google token' });
//     }
// });

// module.exports = router;



// const express = require('express');
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User');
// const generateToken = require('../AuthService/authService');
// const axios = require('axios');
// const qs = require('querystring');

// const router = express.Router();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// async function exchangeCodeForToken(code) {
//     const { data } = await axios.post('https://oauth2.googleapis.com/token', qs.stringify({
//         client_id: process.env.GOOGLE_CLIENT_ID,
//         client_secret: process.env.GOOGLE_CLIENT_SECRET,
//         code,
//         grant_type: 'authorization_code',
//         redirect_uri: process.env.GOOGLE_REDIRECT_URI,
//     }), {
//         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     });

//     return data;
// }

// async function getGoogleUserProfile(access_token) {
//     const peopleResponse = await axios.get(`https://people.googleapis.com/v1/people/me?personFields=genders,birthdays,addresses`, {
//         headers: { Authorization: `Bearer ${access_token}` },
//     });

//     const profile = peopleResponse.data;
//     console.log("Google People API Response:", profile);

//     return {
//         googleId: profile.resourceName.split('/')[1], // Extract Google ID
//         email: profile.emailAddresses ? profile.emailAddresses[0].value : null,
//         name: profile.names ? profile.names[0].displayName : null,
//         gender: profile.genders ? profile.genders[0].value : null,
//         age: profile.birthdays ? new Date().getFullYear() - profile.birthdays[0].date.year : null,
//         location: profile.addresses ? profile.addresses[0].formattedValue : null,
//     };
// }

// router.post('/auth/google', async (req, res) => {
//     const { code } = req.body;

//     try {
//         // Exchange authorization code for tokens
//         const { id_token, access_token } = await exchangeCodeForToken(code);

//         // Fetch user profile from Google API
//         const googleUser = await getGoogleUserProfile(access_token);

//         let user = await User.findOne({ googleId: googleUser.googleId });
//         if (!user) {
//             user = new User({
//                 googleId: googleUser.googleId,
//                 username: googleUser.name,
//                 email: googleUser.email,
//                 gender: googleUser.gender,
//                 age: googleUser.age,
//                 location: googleUser.location,
//             });
//             await user.save();
//         } else {
//             user.gender = googleUser.gender;
//             user.age = googleUser.age;
//             user.location = googleUser.location;
//             await user.save();
//         }

//         const token = generateToken(user);
//         res.json({ token, userId: user._id, message: 'Login successful', user });
//     } catch (error) {
//         console.error("Error during Google login:", error);
//         res.status(400).json({ message: 'Google authentication failed' });
//     }
// });

// module.exports = router;
