
const { verifyFirebaseToken, getFirebaseUser } = require('../config/firebase');

// Verify Firebase ID token (this replaces login/register as Firebase handles that)
exports.verifyToken = async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) {
        return res.status(400).json({ 
            success: false,
            msg: 'No ID token provided' 
        });
    }
    
    try {
        const result = await verifyFirebaseToken(idToken);
        
        if (result.success) {
            // Check if email is verified
            if (!result.user.email_verified) {
                return res.status(403).json({
                    success: false,
                    msg: 'Email not verified. Please check your inbox and click the verification link.',
                    error: 'email_not_verified',
                    requiresEmailVerification: true
                });
            }

            // Token is valid and email is verified, return user info
            res.json({
                success: true,
                user: {
                    uid: result.user.uid,
                    email: result.user.email,
                    name: result.user.name,
                    emailVerified: result.user.email_verified
                },
                msg: 'Authentication successful'
            });
        } else {
            res.status(401).json({
                success: false,
                msg: 'Invalid or expired token',
                error: result.error
            });
        }
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            msg: 'Server error during authentication',
            error: error.message
        });
    }
};

// Get current user info (protected route)
exports.getCurrentUser = async (req, res) => {
    try {
        // User info is already available from middleware
        const userInfo = await getFirebaseUser(req.user.uid);
        
        if (userInfo.success) {
            // Ensure email is verified before returning user data
            if (!userInfo.user.email_verified) {
                return res.status(403).json({
                    success: false,
                    msg: 'Email not verified. Please verify your email before accessing this resource.',
                    error: 'email_not_verified',
                    requiresEmailVerification: true
                });
            }

            res.json({
                success: true,
                user: {
                    uid: userInfo.user.uid,
                    email: userInfo.user.email,
                    name: userInfo.user.name,
                    emailVerified: userInfo.user.email_verified,
                    createdAt: userInfo.user.created_at,
                    lastSignIn: userInfo.user.last_signin
                }
            });
        } else {
            res.status(404).json({
                success: false,
                msg: 'User not found',
                error: userInfo.error
            });
        }
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            msg: 'Server error',
            error: error.message
        });
    }
};

// Logout (client-side handles Firebase signOut, this is just for cleanup if needed)
exports.logout = async (req, res) => {
    try {
        // Firebase handles logout on client side, but we can log it here
        console.log('User logged out:', req.user?.email || 'Unknown user');
        res.json({
            success: true,
            msg: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            msg: 'Server error during logout',
            error: error.message
        });
    }
};