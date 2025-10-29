// server/routes/student.js

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');

// --- TEMPORARY ROUTE TO CATCH FRONTEND ERROR ---
// This is used if the frontend is hardcoded to GET /api/students/profile/1
// In the long run, this route should be removed.
router.get('/profile/:id', authMiddleware, studentController.getProfileById); 
// ------------------------------------------------

// Public routes
router.post('/register', studentController.register);
router.post('/login', studentController.login);

// Protected routes (The Correct Way)
router.get('/profile', authMiddleware, studentController.getProfile);
router.put('/profile', authMiddleware, studentController.updateProfile);

module.exports = router;