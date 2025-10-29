// controllers/authController.js
// Handles the logic for user authentication (admin login).

const jwt = require('jsonwebtoken');
const { getContainer } = require('../config/db');

// Helper: container reference
const container = getContainer();

// Use one consistent secret everywhere
const jwtSecret = process.env.JWT_SECRET || process.env.DUMMY_TOKEN || 'dev-secret';

const login = (req, res) => {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // --- DEBUG LOG ---
    // We are leaving this in one last time to confirm the fix.
    console.log(`--- [SIGNING] Using unified JWT secret: '${jwtSecret ? '[set]' : '[missing]'}'`);

    if (username === adminUsername && password === adminPassword) {
        // --- THIS IS THE CORRECTED LOGIC ---
        // Create the payload for the token.
        const payload = { username: adminUsername, role: 'admin' };
        
        // Use jwt.sign() to create the actual token using the secret key.
        const token = jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour
        );
        
        // Send the GENERATED token in the response.
        res.status(200).json({ message: 'Login successful.', token: token });
    } else {
        // Credentials are incorrect
        res.status(401).json({ message: 'Invalid username or password.' });
    }
};

module.exports = {
    login
};

/**
 * Issue a short-lived JWT for a student given a rollNumber.
 * This endpoint is intended to provide a lightweight student auth token
 * after verifying the student exists (has any achievement record).
 */
const issueStudentToken = async (req, res) => {
    const { rollNumber } = req.body;
    if (!rollNumber) return res.status(400).json({ message: 'rollNumber is required.' });

    try {
        const querySpec = {
            query: 'SELECT TOP 1 c.id, c.rollNumber FROM c WHERE c.rollNumber = @rollNumber',
            parameters: [{ name: '@rollNumber', value: rollNumber }]
        };
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        if (!items || items.length === 0) {
            return res.status(404).json({ message: 'No records found for that roll number.' });
        }

        const payload = { rollNumber, role: 'student' };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        res.status(200).json({ message: 'Student token issued.', token });
    } catch (error) {
        console.error('Error issuing student token:', error);
        res.status(500).json({ message: 'Internal Server Error.' });
    }
};

// Add the export
module.exports.issueStudentToken = issueStudentToken;
