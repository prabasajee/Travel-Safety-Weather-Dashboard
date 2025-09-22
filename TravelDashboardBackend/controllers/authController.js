
const { verifyFirebaseToken, getFirebaseUser } = require('../config/firebase');

// Verify Firebase ID token (this replaces login/register as Firebase handles that)
exports.verifyToken = async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) {
        return res.status(400).json({ msg: 'No ID token provided' });
    }
    
    try {
        const result = await verifyFirebaseToken(idToken);
        
        if (result.success) {
            // Token is valid, return user info
            res.json({
                success: true,
                user: result.user,
                msg: 'Authentication successful'
            });
        } else {
            res.status(401).json({
                success: false,
                msg: 'Invalid token',
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
            res.json({
                success: true,
                user: userInfo.user
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