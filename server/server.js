// server.js
// Main entry point for the Node.js application.

// CRITICAL: Load environment variables FIRST.
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { initializeDatabase } = require('./config/db');
const achievementRoutes = require('./routes/achievements');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const resumeRoutes = require('./routes/resume');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---

// Enable CORS for all routes.
// This must be placed before your route definitions.
app.use(cors());

// Middleware to parse incoming JSON requests.
app.use(express.json());


// --- API Routes ---
app.use('/api/achievements', achievementRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/chat', chatRoutes);


// --- Server Startup ---
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}).catch(error => {
    console.error("Failed to initialize database. Server not started.", error);
    process.exit(1);
});


