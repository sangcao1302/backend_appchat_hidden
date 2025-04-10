const admin = require('firebase-admin');
require('dotenv').config();

// Get the service account credentials from environment variable
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Utility function to send notification to a single user
const sendNotification = async (fcmToken, title, body, data = {}) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            token: fcmToken,
        };

        const response = await admin.messaging().send(message);
        console.log('Successfully sent notification:', response);
        return response;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

// Utility function to send notification to multiple users
const sendMulticastNotification = async (fcmTokens, title, body, data = {}) => {
    try {
        const message = {
            notification: {
                title,
                body,
            },
            data: {
                ...data,
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            tokens: fcmTokens,
        };

        const response = await admin.messaging().sendMulticast(message);
        console.log('Successfully sent multicast notification:', response);
        return response;
    } catch (error) {
        console.error('Error sending multicast notification:', error);
        throw error;
    }
};

module.exports = {
    admin,
    sendNotification,
    sendMulticastNotification,
}; 