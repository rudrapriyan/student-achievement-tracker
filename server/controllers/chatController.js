const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getContainer } = require('../config/db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const handleChat = async (req, res) => {
    try {
        const user = req.user;
        const { message, history } = req.body; // history can be used for context if needed, but for now we focus on single turn with data context
        const container = getContainer();

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined.");
        }

        let systemInstruction = "";
        let contextData = {};

        if (user.role === 'student') {
            // --- STUDENT CONTEXT ---

            // 1. Fetch Profile
            const userQuery = {
                query: "SELECT * FROM c WHERE c.id = @userId",
                parameters: [{ name: "@userId", value: user.id }]
            };
            const { resources: users } = await container.items.query(userQuery).fetchAll();
            const userProfile = users[0] || {};

            // 2. Fetch Achievements
            const achievementQuery = {
                query: "SELECT * FROM c WHERE c.student_id = @userId AND c.type = 'achievement'",
                parameters: [{ name: "@userId", value: user.id }]
            };
            const { resources: achievements } = await container.items.query(achievementQuery).fetchAll();

            systemInstruction = `You are an expert academic advisor for the student. Answer questions based ONLY on the student's personal profile and their submitted achievements. Never discuss or reveal data belonging to other students or general admin statistics. Use a supportive and informative tone.`;

            contextData = {
                profile: {
                    name: userProfile.name,
                    email: userProfile.email,
                    education: userProfile.education,
                    cgpa: userProfile.cgpa // Assuming cgpa might be in profile
                },
                achievements: achievements.map(a => ({
                    title: a.achievementTitle,
                    status: a.status,
                    date: a.achievementDate,
                    description: a.achievementDescription,
                    category: a.category,
                    level: a.level
                }))
            };

        } else if (user.role === 'admin') {
            // --- ADMIN CONTEXT ---

            // Reuse analytics queries
            const statusQuery = { query: "SELECT c.status, COUNT(1) as count FROM c WHERE (c.type = 'achievement' OR NOT IS_DEFINED(c.type)) GROUP BY c.status" };
            const categoryQuery = { query: "SELECT c.category, COUNT(1) as count FROM c WHERE (c.type = 'achievement' OR NOT IS_DEFINED(c.type)) GROUP BY c.category" };
            const levelQuery = { query: "SELECT c.level, COUNT(1) as count FROM c WHERE (c.type = 'achievement' OR NOT IS_DEFINED(c.type)) GROUP BY c.level" };

            const [statusRes, categoryRes, levelRes] = await Promise.all([
                container.items.query(statusQuery).fetchAll(),
                container.items.query(categoryQuery).fetchAll(),
                container.items.query(levelQuery).fetchAll()
            ]);

            const stats = {
                total: 0,
                counts: {},
                byCategory: {},
                byLevel: {}
            };

            statusRes.resources.forEach(item => {
                stats.counts[item.status] = item.count;
                stats.total += item.count;
            });
            categoryRes.resources.forEach(item => { stats.byCategory[item.category] = item.count; });
            levelRes.resources.forEach(item => { stats.byLevel[item.level] = item.count; });

            systemInstruction = `You are a specialized data analyst for the administration. Answer questions based ONLY on the provided aggregated statistics and achievement distribution data. Do not discuss any individual student's personal details, CGPA, or specific names. Use a formal, objective, and analytical tone.`;
            contextData = stats;
        } else {
            return res.status(403).json({ message: "Unauthorized role for chat." });
        }

        // Construct Prompt
        const prompt = `
        ${systemInstruction}

        DATA CONTEXT:
        ${JSON.stringify(contextData, null, 2)}

        USER QUESTION:
        ${message}
        `;

        // Call Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ response: text });

    } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ message: "Failed to process chat request.", error: error.message });
    }
};

module.exports = { handleChat };
