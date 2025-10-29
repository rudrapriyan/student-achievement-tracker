const express = require('express');
const router = express.Router();
const { getContainer } = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const container = getContainer();

// Create routes
router.post('/update-name', authMiddleware, async (req, res) => {
    try {
        const { id, rollNumber } = req.user; // From auth middleware
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Name is required' });
        }

        // Update student document with new name
        const { resource: student } = await container.item(id, id).read();
        student.name = name.trim();

        // Save updates
        await container.item(id, id).replace(student);

        // Update all achievements with this name
        const querySpec = {
            query: "SELECT * FROM c WHERE c.rollNumber = @rollNumber AND c.type = 'achievement'",
            parameters: [{ name: "@rollNumber", value: rollNumber }]
        };

        const { resources: achievements } = await container.items.query(querySpec).fetchAll();
        
        // Update each achievement with the new name
        for (const achievement of achievements) {
            achievement.studentName = name.trim();
            await container.item(achievement.id, achievement.id).replace(achievement);
        }

        // Create new token with updated name
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { 
                id: student.id,
                username: student.username,
                rollNumber: student.rollNumber,
                name: student.name,
                type: 'student'
            },
            process.env.JWT_SECRET || process.env.DUMMY_TOKEN,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Name updated successfully',
            token,
            name: student.name
        });

    } catch (error) {
        console.error('Update name error:', error);
        res.status(500).json({ message: 'Failed to update name' });
    }
});

module.exports = router;