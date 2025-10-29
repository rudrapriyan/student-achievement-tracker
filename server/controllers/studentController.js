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
            const { username, password, rollNumber, name, email, phone, location, linkedin, github, portfolio, degree, institution, graduationYear, gpa } = req.body;

            // Validate required fields
            if (!username || !password || !rollNumber || !name) {
                return res.status(400).json({ message: 'Username, password, roll number, and name are required' });
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

            // Create student document with all profile fields
            const student = {
                username,
                password: hashedPassword,
                rollNumber,
                name,
                email: email || '',
                phone: phone || '',
                location: location || '',
                linkedin: linkedin || '',
                github: github || '',
                portfolio: portfolio || '',
                degree: degree || '',
                institution: institution || '',
                graduationYear: graduationYear || '',
                gpa: gpa || '',
                type: 'student',
                profileComplete: !!(email && phone && degree && institution),
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
                profileComplete: createdStudent.profileComplete,
                student: {
                    username: createdStudent.username,
                    rollNumber: createdStudent.rollNumber,
                    name: createdStudent.name,
                    email: createdStudent.email,
                    phone: createdStudent.phone
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

            // Return success with token and profile completion status
            res.json({
                message: 'Login successful',
                token,
                profileComplete: student.profileComplete || false,
                student: {
                    username: student.username,
                    rollNumber: student.rollNumber,
                    name: student.name,
                    email: student.email,
                    phone: student.phone
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Failed to login' });
        }
    },

    async getProfile(req, res) {
        try {
            const { rollNumber } = req.user; // Use rollNumber for reliability across partition keys

            if (!rollNumber) {
                return res.status(400).json({ message: 'Roll number is missing from token' });
            }

            // Always query by rollNumber (consistent with updateProfile)
            console.log('[getProfile] Querying by rollNumber:', rollNumber);
            const { resources: students } = await container.items
                .query({
                    // Match student document robustly even if legacy records miss type
                    query: "SELECT * FROM c WHERE c.rollNumber = @rollNumber AND (c.type = 'student' OR NOT IS_DEFINED(c.achievementTitle))",
                    parameters: [{ name: "@rollNumber", value: rollNumber }]
                })
                .fetchAll();

            let student = (students && students[0]) || null;

            // Fallback: try by username if not found (older records or missing type)
            if (!student) {
                const username = req.user.username;
                console.warn('[getProfile] No profile by rollNumber. Fallback query by username:', username);
                const byUsername = await container.items
                    .query({
                        query: "SELECT * FROM c WHERE c.username = @username",
                        parameters: [{ name: "@username", value: username }]
                    })
                    .fetchAll();
                student = byUsername.resources && byUsername.resources[0];
            }

            if (!student) {
                console.warn('[getProfile] No existing profile. Creating default profile for rollNumber:', rollNumber);
                // Create a minimal default student profile so the UI can proceed
                const username = req.user.username || `${rollNumber}@rajalakshmi.edu.in`;
                const name = req.user.name || 'Student';
                const defaultProfile = {
                    username,
                    rollNumber,
                    name,
                    email: '',
                    phone: '',
                    location: '',
                    linkedin: '',
                    github: '',
                    portfolio: '',
                    degree: '',
                    institution: '',
                    graduationYear: '',
                    gpa: '',
                    skills: [],
                    education: [],
                    certifications: [],
                    type: 'student',
                    createdAt: new Date().toISOString(),
                };
                const created = await container.items.create(defaultProfile);
                student = created.resource;
            }

            // Remove sensitive information
            const { password, ...profile } = student;

            res.json(profile);

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ message: 'Failed to get profile' });
        }
    },

    async updateProfile(req, res) {
        try {
            console.log('Update profile request from user:', req.user);
            const { rollNumber } = req.user; // Only use rollNumber - it's reliable
            const { name, email, phone, location, linkedin, github, portfolio, degree, institution, graduationYear, gpa, skills, education, certifications } = req.body;
            console.log('Update data:', { rollNumber, name, email, phone, degree, institution, skills: skills?.length, education: education?.length, certifications: certifications?.length });

            if (!rollNumber) {
                return res.status(400).json({ message: 'Roll number is required' });
            }

            // ALWAYS query by rollNumber - most reliable method
            console.log('Querying student by rollNumber:', rollNumber);
            const { resources: students } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.rollNumber = @rollNumber AND c.type = 'student'",
                    parameters: [{ name: "@rollNumber", value: rollNumber }]
                })
                .fetchAll();
                
            if (!students || students.length === 0) {
                console.error('Student not found with rollNumber:', rollNumber);
                return res.status(404).json({ message: 'Student profile not found' });
            }
            
            const student = students[0];
            console.log('Found student:', {
                id: student.id,
                username: student.username,
                rollNumber: student.rollNumber
            });

            // Initialize fields if they don't exist (for old student documents)
            if (!student.email) student.email = '';
            if (!student.phone) student.phone = '';
            if (!student.location) student.location = '';
            if (!student.linkedin) student.linkedin = '';
            if (!student.github) student.github = '';
            if (!student.portfolio) student.portfolio = '';
            if (!student.degree) student.degree = '';
            if (!student.institution) student.institution = '';
            if (!student.graduationYear) student.graduationYear = '';
            if (!student.gpa) student.gpa = '';
            if (!student.skills) student.skills = [];
            if (!student.education) student.education = [];
            if (!student.certifications) student.certifications = [];

            // Update fields if provided
            if (name !== undefined && name !== null) student.name = name;
            if (email !== undefined && email !== null) student.email = email;
            if (phone !== undefined && phone !== null) student.phone = phone;
            if (location !== undefined && location !== null) student.location = location;
            if (linkedin !== undefined && linkedin !== null) student.linkedin = linkedin;
            if (github !== undefined && github !== null) student.github = github;
            if (portfolio !== undefined && portfolio !== null) student.portfolio = portfolio;
            if (degree !== undefined && degree !== null) student.degree = degree;
            if (institution !== undefined && institution !== null) student.institution = institution;
            if (graduationYear !== undefined && graduationYear !== null) student.graduationYear = graduationYear;
            if (gpa !== undefined && gpa !== null) student.gpa = gpa;
            
            // Update dynamic arrays if provided
            if (skills !== undefined) student.skills = Array.isArray(skills) ? skills : [];
            if (education !== undefined) student.education = Array.isArray(education) ? education : [];
            if (certifications !== undefined) student.certifications = Array.isArray(certifications) ? certifications : [];

            console.log('Updated student data:', {
                email: student.email,
                phone: student.phone,
                degree: student.degree,
                institution: student.institution
            });

            // Check if profile is complete (essential ATS fields)
            student.profileComplete = !!(student.name && student.email && student.phone && student.degree && student.institution);
            student.updatedAt = new Date().toISOString();

            // Save updates using upsert (more reliable than replace)
            console.log('Upserting to Cosmos DB:', {
                id: student.id,
                username: student.username,
                rollNumber: student.rollNumber
            });
            
            let updatedStudent;
            try {
                const result = await container.items.upsert(student);
                updatedStudent = result.resource;
                console.log('✅ Profile updated successfully for:', updatedStudent.username);
            } catch (upsertError) {
                console.error('❌ Upsert failed:', {
                    error: upsertError.message,
                    code: upsertError.code,
                    statusCode: upsertError.statusCode,
                    studentId: student.id,
                    rollNumber: student.rollNumber
                });
                
                return res.status(500).json({
                    message: 'Failed to save profile',
                    error: upsertError.message,
                    details: 'Database write error. Please contact support with your roll number: ' + rollNumber
                });
            }

            // Create new token with updated info
            const token = jwt.sign(
                { 
                    id: updatedStudent.id,
                    username: updatedStudent.username,
                    rollNumber: updatedStudent.rollNumber,
                    name: updatedStudent.name,
                    type: 'student'
                },
                jwtSecret,
                { expiresIn: '24h' }
            );

            // Remove sensitive information
            const { password, ...profile } = updatedStudent;

            res.json({
                message: 'Profile updated successfully',
                token,
                profileComplete: updatedStudent.profileComplete,
                profile
            });

        } catch (error) {
            console.error('Update profile error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                user: req.user
            });
            res.status(500).json({ 
                message: 'Failed to update profile',
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },
    
    // --- START OF NEW TEMPORARY DEBUGGING FUNCTION ---
    async getProfileById(req, res) {
        try {
            const studentId = req.params.id; // The ID being sent (e.g., '1')

            // Log the insecure access for debugging purposes
            console.warn(`[INSECURE DEBUG ROUTE] Accessing profile by ID: ${studentId}. This route should be removed once frontend is fixed.`);

            // Query 1: Check by the document ID
            const { resources: students } = await container.items
                .query({
                    query: "SELECT * FROM c WHERE c.id = @id AND c.type = 'student'",
                    parameters: [{ name: "@id", value: studentId }]
                })
                .fetchAll();

            // Query 2: If not found by document ID, check by rollNumber (which is more likely for the frontend)
            if (!students || students.length === 0) {
                 const { resources: studentsByRoll } = await container.items
                    .query({
                        query: "SELECT * FROM c WHERE c.rollNumber = @id AND c.type = 'student'",
                        parameters: [{ name: "@id", value: studentId }]
                    })
                    .fetchAll();
                    
                if (studentsByRoll && studentsByRoll.length > 0) {
                     const { password, ...profile } = studentsByRoll[0];
                     return res.json(profile);
                }

                // If neither found, return the 404 message the frontend expects
                return res.status(404).json({ message: 'Profile not found' });
            }

            // If found by document ID
            const { password, ...profile } = students[0];
            res.json(profile);

        } catch (error) {
            console.error('Get profile by ID error:', error);
            res.status(500).json({ message: 'Failed to get profile by ID' });
        }
    }
    // --- END OF NEW TEMPORARY DEBUGGING FUNCTION ---
};

module.exports = {
    ...studentController,
    getProfileById: studentController.getProfileById
};