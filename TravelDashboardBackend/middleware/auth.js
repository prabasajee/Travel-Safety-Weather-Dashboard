const { verifyFirebaseToken } = require('../config/firebase');

// Authentication middleware to verify Firebase ID token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                msg: 'Access token required',
                error: 'no_token'
            });
        }

        // Verify the Firebase token
        const result = await verifyFirebaseToken(token);

        if (result.success) {
            // Add user info to request object
            req.user = {
                uid: result.user.uid,
                email: result.user.email,
                name: result.user.name,
                emailVerified: result.user.email_verified
            };

            next(); // Continue to the next middleware/route handler
        } else {
            res.status(401).json({
                success: false,
                msg: 'Invalid or expired token',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            msg: 'Server error during authentication',
            error: error.message
        });
    }
};

// Optional authentication middleware (allows both authenticated and unauthenticated requests)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const result = await verifyFirebaseToken(token);
            if (result.success && result.user.email_verified) {
                req.user = {
                    uid: result.user.uid,
                    email: result.user.email,
                    name: result.user.name,
                    emailVerified: result.user.email_verified
                };
            }
        }

        next(); // Continue regardless of token validity
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next(); // Continue even if there's an error
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};
