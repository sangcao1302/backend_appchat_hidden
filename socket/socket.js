const { Server } = require('socket.io');
const User = require('../models/User');
const Message = require('../models/Message'); // Assuming you have a Message model

const activeUsers = {};

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle user login via socket
        socket.on('login', async (userId) => {
            activeUsers[socket.id] = userId;
            await User.findByIdAndUpdate(userId, { online: true, isSeekingMatch: false });
            console.log(`User ${userId} logged in with socket ID ${socket.id}`);
        });

        // Start chat and find a match
        socket.on('startChat', async () => {
            const userId = activeUsers[socket.id];
            if (!userId) {
                return socket.emit('error', 'User is not logged in');
            }

            await User.findByIdAndUpdate(userId, { isSeekingMatch: true });
            const currentUser = await User.findById(userId);

            if (!currentUser) {
                return socket.emit('error', 'Current user not found');
            }

            const oppositeGender = currentUser.gender === 'male' ? 'female' : 'male';
            const oppositeLGBT =currentUser.gender === 'LGBT nam' ? 'LGBT nam' : 'LGBT nữ';
            let availableUsers = await User.find({
                _id: { $ne: userId },
                online: true,
                isSeekingMatch: true,
                location: currentUser.location,
                age: { $gte: currentUser.age - 5, $lte: currentUser.age + 5 },
                $or:[{
                    gender: oppositeGender,
                    gender: oppositeLGBT
                }] // Ensure gender is opposite to the current user
            });
            if (availableUsers.length === 0) {
                availableUsers = await User.find({
                    _id: { $ne: userId },
                    online: true,
                    isSeekingMatch: true,
                    place: currentUser.place,
                    age: { $gte: currentUser.age - 5, $lte: currentUser.age + 5 },
                    $or:[{
                        gender: oppositeGender,
                        gender: oppositeLGBT
                    }] // Ensure gender is opposite to the current user
                });
            }
            const matchedUser = availableUsers.length ? availableUsers[0] : null;

            if (matchedUser) {
                await User.findByIdAndUpdate(matchedUser._id, { isSeekingMatch: false, matchedUser: userId });
                await User.findByIdAndUpdate(userId, { isSeekingMatch: false, matchedUser: matchedUser._id });

                const matchedUserSocketId = Object.keys(activeUsers).find(
                    (key) => activeUsers[key] === matchedUser._id.toString()
                );

                if (matchedUserSocketId) {
                    socket.emit('matchedUser', { username: matchedUser.username, id: matchedUser._id });
                    io.to(matchedUserSocketId).emit('matchedUser', { username: currentUser.username, id: currentUser._id });
                }
            } else {
                socket.emit('waiting');
            }
        });

        // Listen for 'typing' event
        socket.on('typing', ({ receiverId }) => {
            const receiverSocketId = Object.keys(activeUsers).find(
                (socketId) => activeUsers[socketId] === receiverId
            );

            if (receiverSocketId) {
                // Emit 'typing' event to the receiver's socket with the sender's userId
                io.to(receiverSocketId).emit('typing', { userId: activeUsers[socket.id] });
            }
        });

        // Listen for 'stopTyping' event
        socket.on('stopTyping', ({ receiverId }) => {
            const receiverSocketId = Object.keys(activeUsers).find(
                (socketId) => activeUsers[socketId] === receiverId
            );

            if (receiverSocketId) {
                // Emit 'stopTyping' event to the receiver's socket with the sender's userId
                io.to(receiverSocketId).emit('stopTyping', { userId: activeUsers[socket.id] });
            }
        });

        socket.on('message', async (message) => {
            const { text, receiverId, senderId } = message;
            // Save the message to MongoDB only if it doesn't already exist

            // Attempt to send the message to the receiver if they are online
            const receiverSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message', { text, receiverId, senderId });
                console.log(`Message sent to ${receiverId}`);
            }
        });

        socket.on('endChat', async () => {
            const userId = activeUsers[socket.id];
            if (!userId) {
                return socket.emit('error', 'User is not logged in');
            }

            const currentUser = await User.findById(userId);
            if (!currentUser) {
                return socket.emit('error', 'Current user not found');
            }

            const matchedUserId = currentUser.matchedUser;

            if (matchedUserId) {
                const matchedUser = await User.findById(matchedUserId);
                if (matchedUser) {
                    const matchedUserSocketId = Object.keys(activeUsers).find(
                        (key) => activeUsers[key] === matchedUserId.toString()
                    );

                    try {
                        await Message.deleteMany({
                            $or: [
                                { senderId: userId, receiverId: matchedUserId },
                                { senderId: matchedUserId, receiverId: userId }
                            ]
                        });
                        console.log(`Messages between ${userId} and ${matchedUserId} deleted.`);
                    } catch (error) {
                        console.error('Error deleting messages:', error);
                        socket.emit('error', 'Error deleting messages');
                    }

                    await User.findByIdAndUpdate(userId, { matchedUser: null, isSeekingMatch: false });
                    await User.findByIdAndUpdate(matchedUserId, { matchedUser: null, isSeekingMatch: false });

                    socket.emit('chatEnded', { message: 'You have ended the chat and messages were cleared.' });
                    if (matchedUserSocketId) {
                        io.to(matchedUserSocketId).emit('chatEnded', { message: 'The chat was ended by your match and messages were cleared.' });
                    }
                }
            } else {
                socket.emit('chatEnded', { message: 'No active chat to end.' });
            }
        });

        socket.on('disconnect', async () => {
            console.log('User disconnected:', socket.id);
            const userId = activeUsers[socket.id];
            if (userId) {
                delete activeUsers[socket.id];
                const currentUser = await User.findByIdAndUpdate(userId, { online: false, inactive: true });
                console.log(`User ${userId} marked as inactive`);
            }
        });

        // Handle user login via socket (for reconnection as well)
        socket.on('login', async (userId) => {
            activeUsers[socket.id] = userId;
            await User.findByIdAndUpdate(userId, { online: true });

            const currentUser = await User.findById(userId);
            if (currentUser.matchedUser) {
                const matchedUserId = currentUser.matchedUser;
                const matchedUser = await User.findById(matchedUserId);

                if (matchedUser) {
                    socket.emit('matchedUser', { username: matchedUser.username, id: matchedUser._id });

                    const matchedUserSocketId = Object.keys(activeUsers).find(
                        (key) => activeUsers[key] === matchedUserId.toString()
                    );

                    if (matchedUserSocketId) {
                        io.to(matchedUserSocketId).emit('matchedUser', { username: currentUser.username, id: userId });
                    }
                }
            }
        });
    });
}

module.exports = initializeSocket;