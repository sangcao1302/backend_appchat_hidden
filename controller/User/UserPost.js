
const User = require('../../models/User');
async function userPostBan(req, res,io) {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).send('User not found');
        }
        user.BanCount+=1
       await user.save()
        if( user.BanCount===3){
            
            user.Ban = true
            await user.save()
            // console.log(`🚨 User ${userId} is banned! Emitting 'banUser' event.`);
            // io.emit("banUser", userId); // Emit event to all connected clients

            return res.status(200).send('User banned');
        }
    } catch (error) {
        res.status(500).send('Error fetching user');
    }
}
module.exports = {
    userPostBan,
}