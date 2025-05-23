const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    //   password: { type: String, required: true },
    age: { type: Number, },
    location: { type: String, },
    place: { type: String, },
    gender: { type: String, enum: ['male', 'female', 'LGBT nam', 'LGBT nữ'], }, // New gender field
    online: { type: Boolean, default: false },
    isSeekingMatch: { type: Boolean, default: false },
    matchedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    googleId: { type: String, required: true, unique: true },
    BanCount: { type: Number, default: 0 },
    Ban: { type: Boolean, default: false },
    fcmTokens: [{ type: String }], // Array to store multiple FCM tokens for the same user
    notificationSettings: {
        chatMessages: { type: Boolean, default: true },
        matchRequests: { type: Boolean, default: true },
        systemUpdates: { type: Boolean, default: true }
    }
});

module.exports = mongoose.model('User', userSchema);
