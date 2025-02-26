
const User = require('../../models/User');
async function userGet(req, res) {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId)
        res.json(user); 
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
}
module.exports = {
    userGet,
}