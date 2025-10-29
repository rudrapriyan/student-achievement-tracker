// routes/auth.js
// Defines the API endpoint for user authentication.

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/login -> Authenticate a user and get a token
router.post('/login', authController.login);

// POST /api/auth/student-token -> Issue a short-lived JWT for a student (proof of existence required)
router.post('/student-token', authController.issueStudentToken);

module.exports = router;
