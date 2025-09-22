const express = require('express');
const router = express.Router();
const { verifyToken, getCurrentUser, logout } = require('../controllers/authController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Verify Firebase ID token (no auth required - this is the auth endpoint)
router.post('/verify-token', verifyToken);

// Get current user info (protected route - requires verified email)
router.get('/me', authenticateToken, getCurrentUser);

// Logout (requires authentication but we'll be more lenient)
router.post('/logout', optionalAuth, logout);

module.exports = router;
