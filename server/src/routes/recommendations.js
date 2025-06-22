const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  updatePreferences,
  getTrendingBlogs,
  getRelatedBlogs
} = require('../controllers/recommendationController');
const { auth, requireRole } = require('../middleware/auth');

// Protected routes (reader only)
router.get('/', auth, requireRole('reader'), getRecommendations);
router.put('/preferences', auth, updatePreferences);

// Public routes
router.get('/trending', getTrendingBlogs);
router.get('/related/:blogId', getRelatedBlogs);

module.exports = router; 