const express = require('express');
const router = express.Router();

// GET endpoint for testing
router.get('/', (req, res) => {
    res.json({ message: 'Travel API working!' });
});

module.exports = router;
