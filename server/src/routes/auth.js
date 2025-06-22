const express = require('express');
const router = express.Router();
const { signup, login, getCurrentUser } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getCurrentUser);

module.exports = router; 