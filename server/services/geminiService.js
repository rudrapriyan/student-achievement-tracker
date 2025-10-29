const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Use Gemini 1.5 Flash for fast, cost-effective responses
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate achievement description
 */
async function generateAchievementDescription(achievementData) {
    const prompt = `You are an expert resume writer specializing in ATS-optimized achievement descriptions.

Given the following achievement information:
- Title: ${achievementData.title}
- Category: ${achievementData.category}
- Level: ${achievementData.level}
- Basic Description: ${achievementData.description || 'Not provided'}

Generate a professional, ATS-optimized achievement description that:
1. Starts with a strong action verb
2. Quantifies impact where possible
3. Highlights skills demonstrated
4. Is concise (2-3 sentences max)
5. Uses industry-standard terminology

Generate ONLY the description text, no preamble or explanation.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error generating achievement description:', error);
        throw new Error('Failed to generate description');
    }
}

/**
 * Optimize resume bullet point
 */
async function optimizeBulletPoint(text) {
    const prompt = `You are an expert resume optimizer. Given this achievement description:

"${text}"

Generate 3 improved versions that are:
1. ACTION-ORIENTED: Starts with powerful action verb, emphasizes impact
2. QUANTIFIED: Includes numbers, metrics, percentages where logical
3. SKILL-FOCUSED: Highlights technical skills and competencies

Format as JSON:
{
  "actionOriented": "...",
  "quantified": "...",
  "skillFocused": "..."
}

Provide ONLY the JSON, no markdown formatting or explanation.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error optimizing bullet point:', error);
        throw new Error('Failed to optimize bullet point');
    }
}

/**
 * Tailor resume to job description
 */
async function tailorResumeToJob(achievements, jobDescription) {
    const achievementList = achievements.map((a, i) => 
        `${i + 1}. ${a.achievementTitle}: ${a.achievementDescription}`
    ).join('\n');

    const prompt = `You are an expert career advisor. Given these achievements:

${achievementList}

And this job description:
"${jobDescription}"

Analyze which achievements are most relevant to this role and suggest:
1. Top 5 most relevant achievements (with relevance score 0-100)
2. Key skills to emphasize
3. Recommended resume customization tips

Format as JSON:
{
  "relevantAchievements": [
    {"index": 0, "score": 95, "reason": "..."},
    ...
  ],
  "keySkills": ["skill1", "skill2", ...],
  "customizationTips": ["tip1", "tip2", ...]
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error tailoring resume:', error);
        throw new Error('Failed to tailor resume');
    }
}

/**
 * Auto-categorize achievement
 */
async function categorizeAchievement(title, description) {
    const prompt = `You are an achievement categorization expert. Given:

Title: "${title}"
Description: "${description || 'Not provided'}"

Determine the most appropriate:
1. Category: academic, technical, sports, cultural, social, leadership, research, or awards
2. Level: international, national, state, district, or college
3. Tags: 3-5 relevant skill/topic tags

Format as JSON:
{
  "category": "...",
  "level": "...",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.95
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error categorizing achievement:', error);
        throw new Error('Failed to categorize achievement');
    }
}

/**
 * Generate interview prep (STAR format)
 */
async function generateInterviewPrep(achievements) {
    const achievementList = achievements.slice(0, 5).map((a, i) => 
        `${i + 1}. ${a.achievementTitle}: ${a.achievementDescription}`
    ).join('\n');

    const prompt = `You are an interview coach. Given these achievements:

${achievementList}

Generate 3 STAR format interview answers for common behavioral questions:
1. "Tell me about a time you demonstrated leadership"
2. "Describe a challenging project you completed"
3. "Give an example of when you worked in a team"

Format as JSON:
{
  "leadership": {
    "situation": "...",
    "task": "...",
    "action": "...",
    "result": "..."
  },
  "challenge": { ... },
  "teamwork": { ... }
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating interview prep:', error);
        throw new Error('Failed to generate interview prep');
    }
}

/**
 * Extract skills from achievements
 */
async function extractSkills(achievements) {
    const achievementList = achievements.map((a, i) => 
        `${i + 1}. ${a.achievementTitle}: ${a.achievementDescription}`
    ).join('\n');

    const prompt = `You are a skills extraction expert. Analyze these achievements:

${achievementList}

Extract and categorize ALL skills demonstrated:

Format as JSON:
{
  "technical": ["skill1", "skill2", ...],
  "soft": ["skill1", "skill2", ...],
  "tools": ["tool1", "tool2", ...],
  "languages": ["lang1", "lang2", ...],
  "trending": ["skill1", "skill2", ...],
  "recommendations": ["What skills to add based on career path"]
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error extracting skills:', error);
        throw new Error('Failed to extract skills');
    }
}

/**
 * Generate career path recommendations
 */
async function generateCareerPath(profile, achievements) {
    const achievementList = achievements.slice(0, 10).map((a, i) => 
        `${i + 1}. ${a.achievementTitle} (${a.category})`
    ).join('\n');

    const prompt = `You are a career advisor. Given this profile:

Name: ${profile.name}
Degree: ${profile.degree}
Institution: ${profile.institution}

Achievements:
${achievementList}

Recommend:
1. Top 3 career paths based on achievements
2. Required skills for each path
3. Action steps to pursue each path
4. Timeline for skill development

Format as JSON:
{
  "careerPaths": [
    {
      "title": "Software Engineer",
      "matchScore": 85,
      "requiredSkills": ["skill1", ...],
      "actionSteps": ["step1", ...],
      "timeline": "6-12 months"
    },
    ...
  ],
  "strengthsAnalysis": "...",
  "developmentAreas": ["area1", ...]
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error generating career path:', error);
        throw new Error('Failed to generate career path');
    }
}

/**
 * Analyze achievement gaps
 */
async function analyzeAchievementGaps(profile, achievements) {
    const achievementList = achievements.map((a, i) => 
        `${i + 1}. ${a.achievementTitle} (${a.category}, ${a.level})`
    ).join('\n');

    const prompt = `You are a student development advisor. Given this profile:

Degree: ${profile.degree}
Institution: ${profile.institution}
Current Achievements:
${achievementList}

Analyze gaps and recommend:
1. Missing achievement types compared to peers
2. Specific competitions/programs to participate in
3. Skill development areas
4. Timeline and priority for each

Format as JSON:
{
  "missingCategories": ["category1", ...],
  "recommendations": [
    {
      "type": "Competition",
      "name": "...",
      "category": "technical",
      "priority": "high",
      "deadline": "...",
      "reason": "..."
    },
    ...
  ],
  "skillGaps": ["skill1", ...],
  "strengthScore": {
    "academic": 7,
    "technical": 8,
    "leadership": 5,
    "social": 6
  }
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error analyzing gaps:', error);
        throw new Error('Failed to analyze achievement gaps');
    }
}

/**
 * Sentiment analysis for skills/certifications
 */
async function analyzeSentiment(items) {
    const itemList = items.map((item, i) => `${i + 1}. ${item.name || item}`).join('\n');

    const prompt = `You are a professional sentiment analyzer. Rate these items by their impact value for a resume (0-100):

${itemList}

Consider: Industry demand, ATS relevance, employer value, skill transferability

Format as JSON:
{
  "scores": [
    {"index": 0, "score": 95, "reason": "Highly valued in industry"},
    ...
  ]
}

Provide ONLY the JSON, no markdown.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error('Error analyzing sentiment:', error);
        throw new Error('Failed to analyze sentiment');
    }
}

/**
 * Chat assistant
 */
async function chatAssistant(message, context = {}) {
    const contextStr = JSON.stringify(context, null, 2);
    
    const prompt = `You are a helpful career and resume assistant for students. 

User Context:
${contextStr}

User Question: "${message}"

Provide a helpful, concise answer (2-3 paragraphs max). Be encouraging and actionable.

If the question is about:
- Resume: Give specific formatting and content advice
- Achievements: Suggest how to highlight them
- Career: Provide realistic, achievable guidance
- Skills: Recommend learning resources

Provide ONLY the response text, no preamble.`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error in chat assistant:', error);
        throw new Error('Failed to get chat response');
    }
}

module.exports = {
    generateAchievementDescription,
    optimizeBulletPoint,
    tailorResumeToJob,
    categorizeAchievement,
    generateInterviewPrep,
    extractSkills,
    generateCareerPath,
    analyzeAchievementGaps,
    analyzeSentiment,
    chatAssistant
};
