// controllers/authController.js
// Handles the logic for user authentication (students and admin).

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getContainer } = require('../config/db');

// Helper to generate token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name // Include name for frontend display if needed
        },
        process.env.DUMMY_TOKEN,
        { expiresIn: '24h' }
    );
};

const signup = async (req, res) => {
    try {
        const { name, email, password, rollNumber } = req.body;

        if (!name || !email || !password || !rollNumber) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const container = getContainer();

        // Check if user already exists (by email or rollNumber)
        // Note: In a real app, we'd want unique constraints or better querying.
        // For Cosmos DB NoSQL, we can use a query.
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email OR c.rollNumber = @rollNumber",
            parameters: [
                { name: "@email", value: email },
                { name: "@rollNumber", value: rollNumber }
            ]
        };

        const { resources: existingUsers } = await container.items.query(querySpec).fetchAll();

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'User with this email or roll number already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            id: uuidv4(),
            type: 'user', // Discriminator
            name,
            email,
            password: hashedPassword,
            rollNumber,
            role: 'student', // Default role
            createdAt: new Date().toISOString(),
            // Profile fields (initially empty or partial)
            phone: '',
            location: '',
            education: {
                degree: '',
                institute: '',
                cgpa: '',
                graduationYear: ''
            },
            certifications: []
        };

        const { resource: createdUser } = await container.items.create(newUser);

        // Generate token
        const token = generateToken(createdUser);

        res.status(201).json({
            message: 'User created successfully.',
            token,
            user: {
                id: createdUser.id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: 'Internal server error during signup.' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body; // username can be email or rollNumber for students

        // 1. Check for Admin (Environment Variables)
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (username === adminUsername && password === adminPassword) {
            const adminUser = { id: 'admin', username: adminUsername, role: 'admin', name: 'Administrator' };
            const token = generateToken(adminUser);
            return res.status(200).json({ message: 'Admin login successful.', token, user: adminUser });
        }

        // 2. Check for Student (Database)
        const container = getContainer();
        const querySpec = {
            query: "SELECT * FROM c WHERE (c.email = @username OR c.rollNumber = @username) AND c.type = 'user'",
            parameters: [
                { name: "@username", value: username }
            ]
        };

        const { resources: users } = await container.items.query(querySpec).fetchAll();

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);

        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};

module.exports = {
    signup,
    login
};
