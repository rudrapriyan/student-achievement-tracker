// middleware/authMiddleware.js
// This middleware protects routes by validating a JWT.

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (token == null) {
        // No token provided, deny access
        return res.status(401).json({ message: 'Unauthorized: No token provided.' });
    }

    // Verify the token using the secret from your .env file
    const jwtSecret = process.env.JWT_SECRET || process.env.DUMMY_TOKEN || 'dev-secret';
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            // Token is invalid or expired
            return res.status(403).json({ message: 'Forbidden: Invalid token.' });
        }

        // Token is valid, attach user payload to request for later use (optional)
        req.user = user;

        // Proceed to the next middleware or the route handler
        next();
    });
};

// This is the crucial part: exporting the function directly.
// We must NOT wrap it in curly braces like { authMiddleware }.
module.exports = authMiddleware;
