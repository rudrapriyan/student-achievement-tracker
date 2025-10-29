// server.js
// Main entry point for the Node.js application.

// CRITICAL: Load environment variables FIRST.
require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import the cors middleware
const { initializeDatabase } = require('./config/db');
const achievementRoutes = require('./routes/achievements');
const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume'); // --- ADD THIS LINE ---

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
app.use('/api/resume', resumeRoutes);
app.use('/api/students', require('./routes/student')); // Add student routes
app.use('/api/profile', require('./routes/profile')); // Add profile routes


// --- Environment Validation ---
const requiredEnvVars = {
    'COSMOS_ENDPOINT': process.env.COSMOS_ENDPOINT,
    'COSMOS_KEY': process.env.COSMOS_KEY,
    'COSMOS_DATABASE_ID': process.env.COSMOS_DATABASE_ID,
    'COSMOS_CONTAINER_ID': process.env.COSMOS_CONTAINER_ID,
    'DUMMY_TOKEN': process.env.DUMMY_TOKEN,
    'AZURE_OPENAI_ENDPOINT': process.env.AZURE_OPENAI_ENDPOINT,
    'AZURE_OPENAI_KEY': process.env.AZURE_OPENAI_KEY,
    'AZURE_OPENAI_DEPLOYMENT_NAME': process.env.AZURE_OPENAI_DEPLOYMENT_NAME
};

const missingEnvVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars);
    console.error('Please check your .env file');
    process.exit(1);
}

// --- Server Startup ---
initializeDatabase().then(() => {
    console.log('Database initialized successfully');
    console.log('Environment variables validated successfully');
    
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
        console.log('Required services:');
        console.log('- Cosmos DB: Connected');
        console.log(`- Azure OpenAI: ${process.env.AZURE_OPENAI_ENDPOINT ? 'Configured' : 'Not configured (will use mock mode)'}`);
    });
}).catch(error => {
    console.error("Failed to initialize database. Server not started.", error);
    process.exit(1);
});