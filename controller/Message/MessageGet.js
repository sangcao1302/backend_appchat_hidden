
const Message = require('../../models/Message');
async function messageGet(req, res) {
    const { userId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }).sort({ timestamp: 1 }); // Sort by timestamp for chronological order
        res.json(messages);
    } catch (error) {
        res.status(500).send('Error fetching messages');
    }
}
module.exports = {
    messageGet,
}