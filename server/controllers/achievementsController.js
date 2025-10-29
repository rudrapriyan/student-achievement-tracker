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
        // Debug log the incoming request
        console.log('Received achievement submission:', {
            body: req.body,
            user: req.user,
            headers: req.headers
        });

        const {
            achievementTitle,
            category,
            level,
            description,
            evidenceLink,
            date
        } = req.body;

        // Get student info from the JWT token
        if (!req.user) {
            console.error('No user data in request. Token validation may have failed.');
            return res.status(401).json({ message: 'Authentication required. Please log in again.' });
        }

        // Extract student name from the email/username (temporary solution)
        const studentName = req.user.username.split('@')[0]; // Or you could use the rollNumber for now
        const rollNumber = req.user.rollNumber;

        if (!rollNumber) {
            console.error('Missing roll number in token:', req.user);
            return res.status(401).json({ message: 'Invalid user data. Please log in again.' });
        }

        // --- UPDATED VALIDATION ---
        // Basic validation for required fields from the form
        if (!achievementTitle || !category || !level || !description || !date) {
            return res.status(400).json({
                message: 'Please fill out all required fields: Title, Category, Level, Description, and Date'
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
            studentName, // From email username
            rollNumber,
            achievementTitle,
            achievementDescription: description,
            category,
            level,
            achievementDate: date,
            evidenceLink: evidenceLink || '', // Optional
            status: 'pending',
            dateLogged: new Date().toISOString(),
            submittedBy: req.user.username // Add this for tracking
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
        // Detailed error logging
        console.error("Error logging achievement:", {
            error: error.message,
            stack: error.stack,
            body: req.body,
            user: req.user
        });

        // Send appropriate error message based on the type of error
        if (error.code === 409) {
            return res.status(409).json({ message: 'This achievement has already been logged.' });
        } else if (error.code === 401) {
            return res.status(401).json({ message: 'Authentication error. Please log in again.' });
        } else if (error.code === 400) {
            return res.status(400).json({ message: error.message });
        }

        res.status(500).json({ 
            message: 'Internal Server Error while logging achievement. Please try again or contact support.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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


/**
 * Get all achievements for the currently logged-in student
 */
const getStudentAchievements = async (req, res) => {
    try {
        const rollNumber = req.user.rollNumber;
        
        if (!rollNumber) {
            return res.status(401).json({ message: 'Roll number not found in token' });
        }

        const querySpec = {
            query: "SELECT * FROM c WHERE c.rollNumber = @rollNumber AND c.achievementTitle != null ORDER BY c.createdAt DESC",
            parameters: [{ name: "@rollNumber", value: rollNumber }]
        };

        const { resources: achievements } = await container.items.query(querySpec).fetchAll();
        res.status(200).json(achievements);
    } catch (error) {
        console.error("Error fetching student achievements:", error);
        res.status(500).json({ message: 'Failed to fetch achievements' });
    }
};

/**
 * Update an achievement (student can only edit their own)
 * Status is reset to 'pending' after edit for re-validation
 */
const updateAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const rollNumber = req.user.rollNumber;
        const { achievementTitle, achievementDescription, category, level, achievementDate, issuingAuthority } = req.body;

        if (!rollNumber) {
            return res.status(401).json({ message: 'Roll number not found in token' });
        }

        // Robust fetch by query (avoids partition key assumptions)
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        const achievement = items && items[0];

        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        if (achievement.rollNumber !== rollNumber) {
            return res.status(403).json({ message: 'You can only edit your own achievements' });
        }

        // Update the achievement and reset status to pending
        achievement.achievementTitle = achievementTitle ?? achievement.achievementTitle;
        achievement.achievementDescription = achievementDescription ?? achievement.achievementDescription;
        achievement.category = category ?? achievement.category;
        achievement.level = level ?? achievement.level;
        achievement.achievementDate = achievementDate ?? achievement.achievementDate;
        achievement.issuingAuthority = issuingAuthority ?? achievement.issuingAuthority;
        achievement.status = 'pending';
        achievement.updatedAt = new Date().toISOString();

        const { resource: updatedAchievement } = await container.items.upsert(achievement);

        res.status(200).json({
            message: 'Achievement updated successfully. It will be re-validated by admin.',
            achievement: updatedAchievement
        });
    } catch (error) {
        console.error("Error updating achievement:", error);
        res.status(500).json({ message: 'Failed to update achievement' });
    }
};

/**
 * Delete an achievement (student can only delete their own)
 */
const deleteAchievement = async (req, res) => {
    try {
        const { id } = req.params;
        const rollNumber = req.user.rollNumber;

        if (!rollNumber) {
            return res.status(401).json({ message: 'Roll number not found in token' });
        }

        // Robust fetch by query first
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        const achievement = items && items[0];

        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        if (achievement.rollNumber !== rollNumber) {
            return res.status(403).json({ message: 'You can only delete your own achievements' });
        }

        await container.item(achievement.id, achievement.id).delete();

        res.status(200).json({ message: 'Achievement deleted successfully' });
    } catch (error) {
        console.error("Error deleting achievement:", error);
        res.status(500).json({ message: 'Failed to delete achievement' });
    }
};


// Export all controller functions
module.exports = {
    logAchievement,
    validateAchievement,
    getAllAchievements,
    getPendingAchievements,
    getStudentAchievements,
    updateAchievement,
    deleteAchievement
};

