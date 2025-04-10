const { Server } = require('socket.io');
const User = require('../models/User');
const Message = require('../models/Message');
const { sendNotification } = require('../config/firebase');

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

        socket.on("banUser", async (bannedUserId) => {
            console.log(`❌ Banning user ${bannedUserId}`);

            const bannedUserSocketId = Object.keys(activeUsers).find((key) => activeUsers[key] === bannedUserId);
            if (bannedUserSocketId) {
                io.to(bannedUserSocketId).emit("forceLogout");
                setTimeout(() => {
                    io.sockets.sockets.get(bannedUserSocketId)?.disconnect();
                }, 1000);
                delete activeUsers[bannedUserSocketId];
            }

            await User.findByIdAndUpdate(bannedUserId, { banned: true, online: false });
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
            const oppositeLGBT = currentUser.gender === 'LGBT nam' ? 'LGBT nam' : 'LGBT nữ';
            let availableUsers = await User.find({
                _id: { $ne: userId },
                online: true,
                isSeekingMatch: true,
                location: currentUser.location,
                age: { $gte: currentUser.age - 5, $lte: currentUser.age + 5 },
                $or: [
                    { gender: oppositeGender },
                    { gender: oppositeLGBT }
                ]
            });

            if (availableUsers.length === 0) {
                availableUsers = await User.find({
                    _id: { $ne: userId },
                    online: true,
                    isSeekingMatch: true,
                    place: currentUser.place,
                    age: { $gte: currentUser.age - 5, $lte: currentUser.age + 5 },
                    $or: [
                        { gender: oppositeGender },
                        { gender: oppositeLGBT }
                    ]
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

                    // Send FCM notification to matched user if they have tokens
                    if (matchedUser.fcmTokens && matchedUser.fcmTokens.length > 0 && matchedUser.notificationSettings.matchRequests) {
                        for (const token of matchedUser.fcmTokens) {
                            await sendNotification(
                                token,
                                'New Match!',
                                `You matched with ${currentUser.username}`,
                                { type: 'match', userId: currentUser._id.toString() }
                            );
                        }
                    }
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
                io.to(receiverSocketId).emit('typing', { userId: activeUsers[socket.id] });
            }
        });

        // Listen for 'stopTyping' event
        socket.on('stopTyping', ({ receiverId }) => {
            const receiverSocketId = Object.keys(activeUsers).find(
                (socketId) => activeUsers[socketId] === receiverId
            );

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('stopTyping', { userId: activeUsers[socket.id] });
            }
        });

        socket.on('message', async (message) => {
            const { text, receiverId, senderId } = message;

            // Attempt to send the message to the receiver if they are online
            const receiverSocketId = Object.keys(activeUsers).find(key => activeUsers[key] === receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message', { text, receiverId, senderId });
                console.log(`Message sent to ${receiverId}`);
            } else {
                // If receiver is offline, send FCM notification
                const receiver = await User.findById(receiverId);
                const sender = await User.findById(senderId);

                if (receiver && receiver.fcmTokens && receiver.fcmTokens.length > 0 && receiver.notificationSettings.chatMessages) {
                    for (const token of receiver.fcmTokens) {
                        await sendNotification(
                            token,
                            `New message from ${sender.username}`,
                            text,
                            { type: 'message', senderId: senderId.toString() }
                        );
                    }
                }
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

                    // Send FCM notification to matched user if they have tokens
                    if (matchedUser.fcmTokens && matchedUser.fcmTokens.length > 0 && matchedUser.notificationSettings.chatMessages) {
                        for (const token of matchedUser.fcmTokens) {
                            await sendNotification(
                                token,
                                'Chat Ended',
                                `${currentUser.username} has ended the chat`,
                                { type: 'chatEnded', userId: currentUser._id.toString() }
                            );
                        }
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
    });
    return io;
}

module.exports = initializeSocket;


