const express = require('express');
const router = express.Router();
const { generateResume } = require('../controllers/resumeController.js');
const authMiddleware = require('../middleware/authMiddleware');

// Protect resume generation: students must authenticate to get their own resume; admins can fetch any student's resume.
router.post('/generate', authMiddleware, generateResume);

module.exports = router;