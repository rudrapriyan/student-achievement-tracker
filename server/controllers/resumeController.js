const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getContainer } = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fs = require('fs');
const path = require('path');

const generateResume = async (req, res) => {
    try {
        const userId = req.user.id;
        const container = getContainer();

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined in environment variables.");
        }

        // 1. Fetch User Profile
        const userQuery = {
            query: "SELECT * FROM c WHERE c.id = @userId",
            parameters: [{ name: "@userId", value: userId }]
        };
        const { resources: users } = await container.items.query(userQuery).fetchAll();
        if (users.length === 0) return res.status(404).json({ message: 'User not found.' });
        const user = users[0];

        // 2. Fetch Validated Achievements
        const achievementQuery = {
            query: "SELECT * FROM c WHERE c.student_id = @userId AND c.type = 'achievement' AND c.status = 'validated'",
            parameters: [{ name: "@userId", value: userId }]
        };
        const { resources: achievements } = await container.items.query(achievementQuery).fetchAll();

        // 3. Construct Prompt for Gemini
        const prompt = `
            You are an expert technical resume writer. Convert the following student data into a professional, action-oriented resume JSON structure.
            
            Student Profile:
            Name: ${user.name}
            Email: ${user.email}
            Phone: ${user.phone || 'N/A'}
            Location: ${user.location || 'N/A'}
            Education: ${JSON.stringify(user.education || {})}
            Certifications: ${JSON.stringify(user.certifications || [])}

            Achievements (Projects/Honors):
            ${JSON.stringify(achievements.map(a => ({ title: a.achievementTitle, description: a.description, category: a.category, date: a.achievementDate })))}

            Instructions:
            1. Create a "Professional Summary" based on their profile and achievements.
            2. Format "Education" clearly.
            3. List "Skills" inferred from their achievements and education.
            4. Transform "Achievements" into a "Projects" or "Experience" section. Use strong action verbs. Quantify results if possible (e.g., "Improved X by Y%").
            5. Return ONLY valid JSON with this structure:
            {
                "personalInfo": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" },
                "summary": "",
                "education": [ { "degree": "", "institution": "", "year": "", "details": "" } ],
                "skills": [],
                "experience": [ { "title": "", "subtitle": "", "date": "", "description": ["bullet point 1", "bullet point 2"] } ]
            }
        `;

        // 4. Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 5. Parse and Return JSON
        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const resumeData = JSON.parse(jsonStr);

        res.status(200).json(resumeData);

    } catch (error) {
        const logPath = path.join(__dirname, '../server_error.log');
        const errorLog = `\n[${new Date().toISOString()}] ERROR:\n${error.message}\n${JSON.stringify(error, null, 2)}\n`;
        try {
            if (error.response) {
                const responseText = await error.response.text();
                fs.appendFileSync(logPath, errorLog + `Gemini Response: ${responseText}\n`);
            } else {
                fs.appendFileSync(logPath, errorLog);
            }
        } catch (e) {
            console.error("Failed to write to log file:", e);
        }

        console.error("Resume Generation Error Details:", JSON.stringify(error, null, 2));
        res.status(500).json({ message: 'Failed to generate resume.', error: error.message });
    }
};

module.exports = { generateResume };
