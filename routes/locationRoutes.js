// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const { getRegion } = require('../utils/regions');

// router.post('/update-location', async (req, res) => {
//     const { userId, location } = req.body;
//     const place = getRegion(location);

//     try {
//         await User.findByIdAndUpdate(userId, { location, place });
//         res.status(200).json({ message: 'Location and place updated successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating location and place', error });
//     }
// });

// module.exports = router;