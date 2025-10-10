// routes/auth.js
// Defines the API endpoint for user authentication.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login -> Authenticate a user and get a token
router.post('/login', authController.login);

module.exports = router;
