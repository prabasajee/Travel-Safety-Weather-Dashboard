const express = require('express');
const router = express.Router();
const { verifyToken, getCurrentUser, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Verify Firebase ID token
router.post('/verify-token', verifyToken);

// Get current user info (protected route)
router.get('/me', auth, getCurrentUser);

// Logout
router.post('/logout', auth, logout);

module.exports = router;
