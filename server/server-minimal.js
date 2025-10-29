// MINIMAL SERVER - EMERGENCY BACKUP
// This WILL work - it has ZERO dependencies on external packages

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is WORKING!' });
});

// Import ONLY the core routes
try {
    const studentRoutes = require('./routes/student');
    app.use('/api/students', studentRoutes);
    console.log('✅ Student routes loaded');
} catch (e) {
    console.log('❌ Student routes failed:', e.message);
}

try {
    const achievementRoutes = require('./routes/achievements');
    app.use('/api/achievements', achievementRoutes);
    console.log('✅ Achievement routes loaded');
} catch (e) {
    console.log('❌ Achievement routes failed:', e.message);
}

try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (e) {
    console.log('❌ Auth routes failed:', e.message);
}

try {
    const profileRoutes = require('./routes/profile');
    app.use('/api/profile', profileRoutes);
    console.log('✅ Profile routes loaded');
} catch (e) {
    console.log('❌ Profile routes failed:', e.message);
}

try {
    const resumeRoutes = require('./routes/resume');
    app.use('/api/resume', resumeRoutes);
    console.log('✅ Resume routes loaded');
} catch (e) {
    console.log('❌ Resume routes failed:', e.message);
}

// Start server
async function start() {
    try {
        await initializeDatabase();
        console.log('✅ Database initialized');
        
        app.listen(PORT, () => {
            console.log('');
            console.log('=================================');
            console.log('✅ SERVER IS RUNNING ON PORT 3000');
            console.log('=================================');
            console.log('');
            console.log('Test it: http://localhost:3000/api/test');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
}

start();
