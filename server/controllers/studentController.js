const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getContainer } = require('../config/db');

// Use the shared container instance from config/db to keep Cosmos configuration in one place.
const container = getContainer();

// Ensure there's a JWT secret for signing tokens in development.
const jwtSecret = process.env.JWT_SECRET || process.env.DUMMY_TOKEN || 'dev-secret';

const studentController = {
    async register(req, res) {
        try {
            const { username, password, rollNumber, name } = req.body;

            // Validate required fields
            if (!username || !password || !rollNumber || !name) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            // Check if user already exists
            const { resources: existingUsers } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.username = @username OR c.rollNumber = @rollNumber",
                    parameters: [
                        { name: "@username", value: username },
                        { name: "@rollNumber", value: rollNumber }
                    ]
                })
                .fetchAll();

            if (existingUsers.length > 0) {
                return res.status(409).json({ message: 'Username or Roll Number already exists' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create student document
            const student = {
                username,
                password: hashedPassword,
                rollNumber,
                name,
                type: 'student',
                createdAt: new Date().toISOString()
            };

            // Save to database
            const { resource: createdStudent } = await container.items.create(student);

            // Create JWT token
            const token = jwt.sign(
                { 
                    id: createdStudent.id,
                    username: createdStudent.username,
                    rollNumber: createdStudent.rollNumber,
                    name: createdStudent.name,
                    type: 'student'
                },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // Return success with token
            res.status(201).json({
                message: 'Student registered successfully',
                token,
                student: {
                    username: createdStudent.username,
                    rollNumber: createdStudent.rollNumber,
                    name: createdStudent.name
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Failed to register student' });
        }
    },

    async login(req, res) {
        try {
            const { username, password } = req.body;

            // Validate required fields
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }

            // Find student by username
            const { resources: students } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.username = @username AND c.type = 'student'",
                    parameters: [{ name: "@username", value: username }]
                })
                .fetchAll();

            if (students.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const student = students[0];

            // Verify password
            const isValidPassword = await bcrypt.compare(password, student.password);
            if (!isValidPassword) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Create JWT token
            const token = jwt.sign(
                { 
                    id: student.id,
                    username: student.username,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    type: 'student'
                },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // Return success with token
            res.json({
                message: 'Login successful',
                token,
                student: {
                    username: student.username,
                    rollNumber: student.rollNumber,
                    name: student.name
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Failed to login' });
        }
    },

    async getProfile(req, res) {
        try {
            const { id } = req.user; // From auth middleware

            const { resource: student } = await container.item(id, id).read();

            // Remove sensitive information
            const { password, ...profile } = student;

            res.json(profile);

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Failed to get profile' });
        }
    }
};

module.exports = studentController;
