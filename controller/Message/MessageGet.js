
const Message = require('../../models/Message');
async function messageGet(req, res) {
    const { userId, receiverId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: receiverId },
                { senderId: receiverId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).send('Error fetching messages');
    }
}
module.exports = {
    messageGet,
}