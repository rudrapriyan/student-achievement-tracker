// controllers/achievementsController.js
// Handles all the business logic for creating, retrieving, and updating achievements.

const { v4: uuidv4 } = require('uuid');
const { getContainer } = require('../config/db');

// Helper function to get the container object
const container = getContainer();

/**
 * Logs a new student achievement.
 */
const logAchievement = async (req, res) => {
    try {
        const {
            studentName,
            rollNumber,
            achievementTitle,
            achievementDescription,
            category,
            level,
            achievementDate,
            issuingAuthority,
            evidenceLink // Now a required field
        } = req.body;

        // --- UPDATED VALIDATION ---
        // Basic validation now includes evidenceLink
        if (!studentName || !rollNumber || !achievementTitle || !category || !level || !achievementDate || !issuingAuthority || !evidenceLink) {
            return res.status(400).json({
                message: 'Missing required fields: All fields, including Evidence Link, are now required.'
            });
        }

        // Pre-emptive duplicate check
        const querySpec = {
            query: "SELECT * FROM c WHERE c.rollNumber = @rollNumber AND c.achievementTitle = @achievementTitle",
            parameters: [
                { name: "@rollNumber", value: rollNumber },
                { name: "@achievementTitle", value: achievementTitle }
            ]
        };

        const { resources: existingAchievements } = await container.items.query(querySpec).fetchAll();

        if (existingAchievements.length > 0) {
            return res.status(409).json({ message: 'This achievement has already been logged for this student.' });
        }


        const newAchievement = {
            id: uuidv4(),
            studentName,
            rollNumber,
            achievementTitle,
            achievementDescription,
            category,
            level,
            achievementDate,
            issuingAuthority,
            evidenceLink,
            status: 'pending',
            dateLogged: new Date().toISOString()
        };

        const { resource: createdAchievement } = await container.items.create(newAchievement);
        
        res.status(201).json({
            message: 'Achievement logged successfully and is pending validation.',
            achievement: {
                id: createdAchievement.id,
                studentName: createdAchievement.studentName,
                rollNumber: createdAchievement.rollNumber,
                status: createdAchievement.status
            }
        });

    } catch (error) {
        console.error("Error logging achievement:", error);
        res.status(500).json({ message: 'Internal Server Error while logging achievement.' });
    }
};

/**
 * Validates or rejects an achievement. (Admin only)
 */
const validateAchievement = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`--- [VALIDATE] Attempting to find and update achievement with ID: ${id}`);

    if (status !== 'validated' && status !== 'rejected') {
        return res.status(400).json({ message: 'Invalid status provided. Must be "validated" or "rejected".' });
    }

    try {
        // Use a query to find the item, which is more robust than a point-read if partition keys are uncertain.
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };
        
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        const achievement = items[0];

        if (!achievement) {
            console.warn(`--- [VALIDATE] Query succeeded but no resource was found for ID: ${id}`);
            return res.status(404).json({ message: 'Achievement not found.' });
        }
        
        achievement.status = status;
        const { resource: updatedAchievement } = await container.items.upsert(achievement);
        res.status(200).json({ message: 'Achievement status updated successfully.', achievement: updatedAchievement });

    } catch (error) {
        if (error.code === 404) {
            console.warn(`--- [VALIDATE] Caught 404 error for achievement ID: ${id}.`);
            return res.status(404).json({ message: 'Achievement not found.' });
        }
        
        console.error("Error validating achievement:", error);
        res.status(500).json({ message: 'Internal Server Error while updating achievement.' });
    }
};

/**
 * Retrieves all achievements. (Admin only)
 */
const getAllAchievements = async (req, res) => {
    try {
        const { resources: achievements } = await container.items.readAll().fetchAll();
        res.status(200).json(achievements);
    } catch (error) {
        console.error("Error fetching all achievements:", error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

/**
 * Retrieves only achievements with a 'pending' status. (Admin only)
 */
const getPendingAchievements = async (req, res) => {
    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.status = @status",
            parameters: [
                { name: "@status", value: "pending" }
            ]
        };
        const { resources: achievements } = await container.items.query(querySpec).fetchAll();
        res.status(200).json(achievements);
    } catch (error) {
        console.error("Error fetching pending achievements:", error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};


// Export all controller functions
module.exports = {
    logAchievement,
    validateAchievement,
    getAllAchievements,
    getPendingAchievements
};

