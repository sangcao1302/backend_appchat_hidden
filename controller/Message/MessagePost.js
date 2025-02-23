
const Message = require('../../models/Message');
async function messagePost(req, res) {
    const { senderId, receiverId, text } = req.body;

    const existingMessage = await Message.findOne({
        senderId,
        receiverId,
        text,
        createdAt: { $gt: new Date(Date.now() - 60000) } // 1 minute timeframe
    });

    if (existingMessage) {
        return res.status(400).send('Duplicate message detected');
    }

    const message = new Message({ senderId, receiverId, text });

    try {
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            res.status(400).send('Duplicate message detected');
        } else {
            res.status(500).send('Server error');
        }
    }
}
module.exports = {
    messagePost,
}