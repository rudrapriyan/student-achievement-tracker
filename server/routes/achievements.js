// routes/achievements.js
// Defines all the API endpoints related to achievements.

const express = require('express');
const router = express.Router();

// Import the entire controller module as a single object.
const achievementController = require('../controllers/achievementsController');

// --- DEBUGGING LOG ---
// This will show us the exact structure of what this file is importing.
console.log("--- ROUTER RECEIVED ---", achievementController);

const authMiddleware = require('../middleware/authMiddleware');

// --- Public Route ---
// POST /api/achievements/log
router.post('/log', authMiddleware, achievementController.logAchievement);

// GET /api/achievements/my-achievements
router.get('/my-achievements', authMiddleware, achievementController.getMyAchievements);

// GET /api/achievements/analytics
router.get('/analytics', authMiddleware, achievementController.getAdminAnalytics); // New Analytics Route


// --- Admin-Only Routes (Protected by authMiddleware) ---

// GET /api/achievements/
router.get('/', authMiddleware, achievementController.getAllAchievements);

// GET /api/achievements/pending
router.get('/pending', authMiddleware, achievementController.getPendingAchievements);

// PUT /api/achievements/:id/validate
router.put('/:id/validate', authMiddleware, achievementController.validateAchievement);


module.exports = router;

