const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const geminiService = require('../services/geminiService');
const rateLimit = require('express-rate-limit');

// Rate limiting for AI endpoints (15 requests per minute per user)
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 15,
    message: { error: 'Too many AI requests, please try again later' }
});

/**
 * POST /api/ai/generate-description
 * Generate achievement description
 */
router.post('/generate-description', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { title, category, level, description } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await geminiService.generateAchievementDescription({
            title,
            category,
            level,
            description
        });

        res.json({ description: result });
    } catch (error) {
        console.error('Error generating description:', error);
        res.status(500).json({ error: 'Failed to generate description' });
    }
});

/**
 * POST /api/ai/optimize-bullet
 * Optimize bullet point
 */
router.post('/optimize-bullet', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const result = await geminiService.optimizeBulletPoint(text);
        res.json(result);
    } catch (error) {
        console.error('Error optimizing bullet:', error);
        res.status(500).json({ error: 'Failed to optimize bullet point' });
    }
});

/**
 * POST /api/ai/tailor-resume
 * Tailor resume to job description
 */
router.post('/tailor-resume', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { achievements, jobDescription } = req.body;
        
        if (!achievements || !jobDescription) {
            return res.status(400).json({ error: 'Achievements and job description are required' });
        }

        const result = await geminiService.tailorResumeToJob(achievements, jobDescription);
        res.json(result);
    } catch (error) {
        console.error('Error tailoring resume:', error);
        res.status(500).json({ error: 'Failed to tailor resume' });
    }
});

/**
 * POST /api/ai/categorize
 * Auto-categorize achievement
 */
router.post('/categorize', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await geminiService.categorizeAchievement(title, description);
        res.json(result);
    } catch (error) {
        console.error('Error categorizing:', error);
        res.status(500).json({ error: 'Failed to categorize achievement' });
    }
});

/**
 * POST /api/ai/interview-prep
 * Generate interview preparation
 */
router.post('/interview-prep', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { achievements } = req.body;
        
        if (!achievements || achievements.length === 0) {
            return res.status(400).json({ error: 'Achievements are required' });
        }

        const result = await geminiService.generateInterviewPrep(achievements);
        res.json(result);
    } catch (error) {
        console.error('Error generating interview prep:', error);
        res.status(500).json({ error: 'Failed to generate interview prep' });
    }
});

/**
 * POST /api/ai/extract-skills
 * Extract skills from achievements
 */
router.post('/extract-skills', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { achievements } = req.body;
        
        if (!achievements || achievements.length === 0) {
            return res.status(400).json({ error: 'Achievements are required' });
        }

        const result = await geminiService.extractSkills(achievements);
        res.json(result);
    } catch (error) {
        console.error('Error extracting skills:', error);
        res.status(500).json({ error: 'Failed to extract skills' });
    }
});

/**
 * POST /api/ai/career-path
 * Generate career path recommendations
 */
router.post('/career-path', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { profile, achievements } = req.body;
        
        if (!profile || !achievements) {
            return res.status(400).json({ error: 'Profile and achievements are required' });
        }

        const result = await geminiService.generateCareerPath(profile, achievements);
        res.json(result);
    } catch (error) {
        console.error('Error generating career path:', error);
        res.status(500).json({ error: 'Failed to generate career path' });
    }
});

/**
 * POST /api/ai/analyze-gaps
 * Analyze achievement gaps
 */
router.post('/analyze-gaps', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { profile, achievements } = req.body;
        
        if (!profile || !achievements) {
            return res.status(400).json({ error: 'Profile and achievements are required' });
        }

        const result = await geminiService.analyzeAchievementGaps(profile, achievements);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing gaps:', error);
        res.status(500).json({ error: 'Failed to analyze achievement gaps' });
    }
});

/**
 * POST /api/ai/sentiment-analysis
 * Analyze sentiment/value of skills/certifications
 */
router.post('/sentiment-analysis', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { items } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Items are required' });
        }

        const result = await geminiService.analyzeSentiment(items);
        res.json(result);
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
});

/**
 * POST /api/ai/chat
 * Chat assistant
 */
router.post('/chat', authMiddleware, aiLimiter, async (req, res) => {
    try {
        const { message, context } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const result = await geminiService.chatAssistant(message, context);
        res.json({ response: result });
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Failed to get chat response' });
    }
});

module.exports = router;
