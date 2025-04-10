const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendNotification } = require('../config/firebase');

// Update FCM token for a user
router.post('/token', async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;

        if (!userId || !fcmToken) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add token if it doesn't exist
        if (!user.fcmTokens.includes(fcmToken)) {
            user.fcmTokens.push(fcmToken);
            await user.save();
        }

        res.json({ message: 'FCM token updated successfully' });
    } catch (error) {
        console.error('Error updating FCM token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove FCM token for a user
router.delete('/token', async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;

        if (!userId || !fcmToken) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the token
        user.fcmTokens = user.fcmTokens.filter(token => token !== fcmToken);
        await user.save();

        res.json({ message: 'FCM token removed successfully' });
    } catch (error) {
        console.error('Error removing FCM token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update notification settings
router.put('/settings', async (req, res) => {
    try {
        const { userId, settings } = req.body;

        if (!userId || !settings) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.notificationSettings = {
            ...user.notificationSettings,
            ...settings
        };

        await user.save();
        res.json({ message: 'Notification settings updated successfully' });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Send notification to a user
router.post('/send', async (req, res) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.fcmTokens.length === 0) {
            return res.status(400).json({ error: 'No FCM tokens found for user' });
        }

        // Send notification to all user's tokens
        const results = [];
        for (const token of user.fcmTokens) {
            try {
                const result = await sendNotification(
                    token,
                    title,
                    body,
                    data || {}
                );
                results.push(result);
            } catch (error) {
                console.error(`Error sending notification to token ${token}:`, error);
                // Continue with other tokens even if one fails
            }
        }

        res.json({
            message: 'Notifications sent successfully',
            results
        });
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Test notification
router.post('/test', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Missing user ID' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.fcmTokens.length === 0) {
            return res.status(400).json({ error: 'No FCM tokens found for user' });
        }

        // Send test notification to all user's tokens
        for (const token of user.fcmTokens) {
            await sendNotification(
                token,
                'Test Notification',
                'This is a test notification from the server',
                { type: 'test' }
            );
        }

        res.json({ message: 'Test notification sent successfully' });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 