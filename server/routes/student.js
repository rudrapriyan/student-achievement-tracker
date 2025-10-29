const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', studentController.register);
router.post('/login', studentController.login);

// Protected routes
router.get('/profile', authMiddleware, studentController.getProfile);

module.exports = router;
