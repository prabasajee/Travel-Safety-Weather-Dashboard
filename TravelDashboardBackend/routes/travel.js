const express = require('express');
const router = express.Router();
const { searchTravel, getWeather, getSafety, getCountryInfo } = require('../controllers/travelController');
const { authenticateToken } = require('../middleware/auth');
const TravelHistory = require('../models/TravelHistory');

// GET endpoint for testing
router.get('/', (req, res) => {
    res.json({ message: 'Travel API working!' });
});

// POST /api/travel/records - Submit travel data
router.post('/records', authenticateToken, async (req, res) => {
  try {
    const { location, weather, temperature, safetyScore, safetyLevel, notes } = req.body;
    const userId = req.user.uid;

    // Validation
    if (!location || !location.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Location is required and cannot be empty'
      });
    }

    // Create new travel record
    const travelRecord = new TravelHistory({
      userId,
      location: location.trim(),
      weather: weather || '',
      temperature: temperature || null,
      safety: {
        score: safetyScore || 50,
        level: safetyLevel || 'Caution'
      },
      notes: notes || '',
      isFavorite: false,
      rating: 0
    });

    // Save to MongoDB
    const savedRecord = await travelRecord.save();

    console.log(`✅ POST /api/travel/records - Record saved: ${location}`);

    res.status(201).json({
      success: true,
      message: 'Travel record saved successfully',
      data: savedRecord,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ POST /api/travel/records Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error saving travel record',
      error: error.message
    });
  }
});

// GET /api/travel/records - Retrieve all travel records
router.get('/records', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = parseInt(req.query.skip) || 0;

    // Fetch records with sorting
    const records = await TravelHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    // Get total count
    const total = await TravelHistory.countDocuments({ userId });

    console.log(`✅ GET /api/travel/records - Retrieved ${records.length} records (Total: ${total})`);

    res.status(200).json({
      success: true,
      message: 'Records retrieved successfully',
      data: records,
      pagination: {
        total,
        limit,
        skip,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ GET /api/travel/records Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving records',
      error: error.message
    });
  }
});

// Search for travel information (requires authentication)
router.post('/search', authenticateToken, searchTravel);

// Get weather data for a location (requires authentication)
router.get('/weather/:location', authenticateToken, getWeather);

// Get safety information for a location (requires authentication)
router.get('/safety/:location', authenticateToken, getSafety);

// Get country information (requires authentication)
router.get('/country/:location', authenticateToken, getCountryInfo);

module.exports = router;
