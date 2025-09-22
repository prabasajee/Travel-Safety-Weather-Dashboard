// Firebase Admin SDK initialization
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
    try {
        if (!admin.apps.length) {
            // Use environment variables only (secure for production)
            const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
            
            if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
                throw new Error('Missing required Firebase environment variables');
            }
            
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log('Firebase Admin initialized with environment variables');
        }
    } catch (error) {
        console.error('Firebase Admin initialization failed:', error.message);
    }
};

// Verify Firebase Auth token
const verifyFirebaseToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return {
            success: true,
            user: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                email_verified: decodedToken.email_verified,
                name: decodedToken.name || decodedToken.email?.split('@')[0]
            }
        };
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Get user by UID
const getFirebaseUser = async (uid) => {
    try {
        const userRecord = await admin.auth().getUser(uid);
        return {
            success: true,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                email_verified: userRecord.emailVerified,
                name: userRecord.displayName || userRecord.email?.split('@')[0],
                created_at: userRecord.metadata.creationTime,
                last_signin: userRecord.metadata.lastSignInTime
            }
        };
    } catch (error) {
        console.error('Get user failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// Initialize Firebase when this module is loaded
initializeFirebase();

module.exports = {
    admin,
    verifyFirebaseToken,
    getFirebaseUser,
    initializeFirebase
};
