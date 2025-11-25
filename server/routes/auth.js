// routes/auth.js
// Defines the API endpoint for user authentication.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login -> Authenticate a user and get a token
router.post('/login', authController.login);

// POST /api/auth/signup -> Register a new user
router.post('/signup', authController.signup);

module.exports = router;
