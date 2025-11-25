const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes here are protected
router.use(authMiddleware);

// GET /api/user/profile
router.get('/profile', userController.getProfile);

// PUT /api/user/profile
router.put('/profile', userController.updateProfile);

// GET /api/user/dashboard
router.get('/dashboard', userController.getDashboardStats);

module.exports = router;
