// controllers/userController.js
const { getContainer } = require('../config/db');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`Fetching profile for user ID: ${userId}`);
        const container = getContainer();

        // Use query instead of point read to be robust against Partition Key configuration
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };

        const { resources: users } = await container.items.query(querySpec).fetchAll();

        if (users.length === 0) {
            console.log(`User ${userId} not found in database.`);
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        // Exclude password
        const { password, ...userProfile } = user;
        res.status(200).json(userProfile);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Error fetching profile.' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const container = getContainer();

        // Fetch user first
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };
        const { resources: users } = await container.items.query(querySpec).fetchAll();

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        // Update allowed fields
        const allowedUpdates = ['phone', 'location', 'education', 'certifications', 'name'];
        let hasUpdates = false;

        allowedUpdates.forEach(field => {
            if (updates[field] !== undefined) {
                user[field] = updates[field];
                hasUpdates = true;
            }
        });

        if (hasUpdates) {
            // Use upsert to update the item
            const { resource: updatedUser } = await container.items.upsert(user);
            const { password, ...userProfile } = updatedUser;
            res.status(200).json({ message: 'Profile updated.', user: userProfile });
        } else {
            res.status(200).json({ message: 'No changes made.' });
        }

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: 'Error updating profile.' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const container = getContainer();

        // Query achievements for this user
        const querySpec = {
            query: "SELECT * FROM c WHERE c.student_id = @userId AND c.type = 'achievement'",
            parameters: [{ name: "@userId", value: userId }]
        };

        const { resources: achievements } = await container.items.query(querySpec).fetchAll();

        const stats = {
            total: achievements.length,
            accepted: achievements.filter(a => a.status === 'validated').length,
            rejected: achievements.filter(a => a.status === 'rejected').length,
            pending: achievements.filter(a => a.status === 'pending').length
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: 'Error fetching stats.' });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    getDashboardStats
};
