// controllers/authController.js
// Handles the logic for user authentication (admin login).

const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // --- DEBUG LOG ---
    // We are leaving this in one last time to confirm the fix.
    console.log(`--- [SIGNING] Using DUMMY_TOKEN: '${process.env.DUMMY_TOKEN}'`);

    if (username === adminUsername && password === adminPassword) {
        // --- THIS IS THE CORRECTED LOGIC ---
        // Create the payload for the token.
        const payload = { username: adminUsername, role: 'admin' };
        
        // Use jwt.sign() to create the actual token using the secret key.
        const token = jwt.sign(
            payload,
            process.env.DUMMY_TOKEN,
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
