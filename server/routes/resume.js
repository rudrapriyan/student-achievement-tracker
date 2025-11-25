const express = require('express');
const router = express.Router();
const { generateResume } = require('../controllers/resumeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, generateResume);

module.exports = router;
