const { getContainer } = require('../config/db'); // Use your existing DB connection

// --- Read keys from the .env file ---
const openAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
const openAIKey = process.env.AZURE_OPENAI_KEY;
const openAIDeploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

// Validate the Azure OpenAI configuration
if (!openAIEndpoint || !openAIKey || !openAIDeploymentName) {
  console.error("ERROR: Azure OpenAI environment variables are not set in /server/.env");
  // Do not throw here — allow the server to start but return 503 from the endpoint if called
}

// Get the Cosmos DB container
const container = getContainer();

// Helper to call Azure OpenAI REST API directly (avoids SDK/ESM issues)
async function callAzureChatCompletions(deployment, messages, maxTokens = 1500) {
  if (!openAIEndpoint || !openAIKey || !deployment) {
    throw new Error('Azure OpenAI configuration is incomplete');
  }

  try {
    // Ensure endpoint ends with a slash
    const base = openAIEndpoint.endsWith('/') ? openAIEndpoint : openAIEndpoint + '/';
    const url = `${base}openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=2023-05-15`;

    console.log('Calling Azure OpenAI URL:', url);

    const body = {
      messages,
      max_tokens: maxTokens
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': openAIKey
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Azure OpenAI Error Response:', {
        status: res.status,
        statusText: res.statusText,
        body: text,
        deployment: deployment
      });
      throw new Error(`Azure OpenAI request failed: ${res.status} ${res.statusText} - ${text}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Azure OpenAI Call Failed:', {
      error: error.message,
      deployment: deployment,
      endpoint: openAIEndpoint
    });
    throw new Error('Azure OpenAI service is not available. Using mock mode.');
  }
}

/**
 * @desc    Generate a FULL resume using GenAI
 * @route   POST /api/resume/generate
 * @access  Public
 */
const generateResume = async (req, res) => {
  // If Azure OpenAI is not configured, we allow a mock-generation mode for local testing.
  const allowMock = !openAIEndpoint || !openAIKey || !openAIDeploymentName;

  try {
    // Authorization: require JWT (admin or student)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let requester = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        requester = jwt.verify(token, process.env.DUMMY_TOKEN);
      } catch (err) {
        return res.status(403).json({ message: 'Forbidden: Invalid token.' });
      }
    } else {
      return res.status(401).json({ message: 'Unauthorized: A valid token is required to generate resumes.' });
    }
    // -----------------------------------------------------------------
    // STEP 1: Get rollNumber from the frontend request
    // -----------------------------------------------------------------
    // Determine which rollNumber to use based on requester role/type
    let { rollNumber } = req.body || {};
    const userRole = requester.role || requester.type; // Support both role and type fields

    // Log the requester info for debugging
    console.log('Resume generation request from:', {
        userRole,
        requestedRollNumber: rollNumber,
        requesterRollNumber: requester.rollNumber,
        requester
    });

    if (userRole === 'student') {
        // Students can only generate their own resume
        if (!rollNumber) rollNumber = requester.rollNumber;
        if (rollNumber !== requester.rollNumber) {
            return res.status(403).json({ message: 'Forbidden: students can only generate their own resume.' });
        }
    } else if (userRole === 'admin') {
        // Admins must supply a rollNumber
        if (!rollNumber) {
            return res.status(400).json({ message: 'rollNumber is required in the request body.' });
        }
    } else {
        return res.status(403).json({ 
            message: 'Forbidden: role not allowed to generate resumes.',
            details: `User role "${userRole}" is not recognized. Must be "student" or "admin".`
        });
    }

    // -----------------------------------------------------------------
    // STEP 2: Get ALL Validated Achievements
    // -----------------------------------------------------------------
    console.log('Querying achievements for rollNumber:', rollNumber);
    const querySpec = {
      query: "SELECT * FROM c WHERE c.rollNumber = @rollNumber AND c.status = 'validated'",
      parameters: [ { name: "@rollNumber", value: rollNumber } ]
    };

    let achievements;
    try {
      const response = await container.items.query(querySpec).fetchAll();
      achievements = response.resources;
      console.log(`Found ${achievements?.length || 0} validated achievements`);
    } catch (error) {
      console.error('Database query failed:', error);
      throw new Error('Failed to retrieve achievements from database');
    }

    if (!achievements || achievements.length === 0) {
      return res.status(404).json({ 
        message: "No validated achievements found for this roll number.",
        details: "Please submit some achievements and wait for them to be validated by an admin."
      });
    }

    // -----------------------------------------------------------------
    // STEP 3: Write the new, much more powerful prompt
    // -----------------------------------------------------------------
    
    // Get the student's name from the first achievement record or from the JWT token
    const studentName = achievements[0].studentName || requester.name || '';
    
    // If we still don't have a name, try to find it in any achievement
    const nameFromAchievements = achievements.find(a => a.studentName)?.studentName;
    if (!studentName && nameFromAchievements) {
      studentName = nameFromAchievements;
    }

    // Convert all achievements into a single text block for the AI
    const achievementsText = achievements.map(ach => {
      return `
- Category: ${ach.category}
- Title: ${ach.achievementTitle}
- Description: ${ach.achievementDescription}
- Issuer: ${ach.issuingAuthority}
- Date: ${ach.achievementDate}
- Level: ${ach.level}
      `;
    }).join("");

    // --- This is the ATS-optimized prompt ---
    const systemPrompt = `You are an expert technical resume writer. Your task is to generate a professional, ATS-friendly, single-page resume for a computer science student named ${studentName}.

CRITICAL RULES:
1. **Format:** Generate JSON output in exactly this structure:
{
  "personalInfo": {
    "name": "${studentName}",
    "location": "Based on achievements or empty",
    "email": "Not provided - leave empty",
    "phone": "Not provided - leave empty",
    "linkedin": "Extract from achievements if found, else empty",
    "github": "Extract from achievements if found, else empty",
    "portfolio": "Extract from achievements if found, else empty"
  },
  "objective": "Write a 2-3 sentence career objective focusing on skills shown in achievements",
  "education": [
    {
      "institution": "Extract from Academic achievements",
      "degree": "Extract from Academic achievements",
      "score": "Extract score/grade if available",
      "scoreType": "CGPA/Percentage/GPA based on data",
      "dates": "Extract from achievements"
    }
  ],
  "technicalSkills": {
    "languages": ["Extract from Technical/Research achievements"],
    "web": ["Extract web technologies"],
    "frameworksAndTools": ["Extract frameworks, libraries, tools"],
    "platforms": ["Extract platforms, cloud services"],
    "concepts": ["Extract CS concepts, methodologies"]
  },
  "projects": [
    {
      "title": "From Technical/Research achievements",
      "description": "Create clear, action-verb focused descriptions",
      "githubLink": "Extract if available",
      "liveLink": "Extract if available"
    }
  ],
  "experience": [
    {
      "organization": "From Internship/Leadership achievements",
      "role": "Extract or infer from description",
      "location": "Extract if available",
      "dates": "From achievement date",
      "responsibilities": [
        "Convert description into 2-3 bullet points",
        "Focus on quantifiable achievements",
        "Use action verbs and technical details"
      ]
    }
  ],
  "achievements": [
    {
      "title": "From remaining achievements",
      "event": "Include competition/award details"
    }
  ],
  "extraCurricularActivities": [
    {
      "role": "From Leadership/Volunteer achievements",
      "event": "Name of activity/organization"
    }
  ]
}

2. **Content Rules:**
   * Use achievements data to populate ALL relevant sections
   * Do NOT invent or assume information not in achievements
   * Convert achievement descriptions into professional, action-verb focused content
   * Prioritize technical and quantifiable achievements
   * Ensure all dates are consistent and clear
   * Make descriptions ATS-friendly by including relevant keywords naturally

3. **Extraction Rules:**
   * Technical Skills: Only include technologies explicitly mentioned
   * Projects: Focus on technical projects with clear outcomes
   * Experience: Prioritize professional and leadership experiences
   * Education: Only include verifiable academic achievements
   * Keep content concise but impactful`;
    
    const userPrompt = `Here is the full list of my achievements. Please sort them and generate my resume:
---
${achievementsText}
---`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // -----------------------------------------------------------------
    // STEP 4: Call AI and Send Response
    // -----------------------------------------------------------------
    console.log(`Calling Azure OpenAI for ${studentName} (${rollNumber}) for a FULL RESUME...`);

    // Use mock mode if Azure isn't configured, caller requested it, or Azure call will fail
    let useMock = allowMock || req.query.mock === 'true' || req.body.mock === true;

    if (!useMock) {
      try {
        const result = await callAzureChatCompletions(openAIDeploymentName, messages, 1500);
        const generatedJSON = result.choices?.[0]?.message?.content;
        if (!generatedJSON) {
          throw new Error('No response from Azure OpenAI');
        }
        return res.status(200).json(JSON.parse(generatedJSON));
      } catch (error) {
        console.log('Azure OpenAI failed, falling back to mock mode:', error.message);
        useMock = true; // Fall back to mock mode
      }
    }

    if (useMock) {
      console.log('Using mock mode for resume generation');
      // Build a simple resume from the achievements list
      const techKeywords = {
        languages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust"],
        web: ["React", "Node", "Express", "HTML", "CSS", "Angular", "Vue"],
        frameworksAndTools: ["Docker", "Kubernetes", "Git", "Selenium", "UIPath", "Jenkins"],
        platforms: ["AWS", "Azure", "GCP", "Linux", "Windows"],
        databases: ["SQL", "Postgres", "MongoDB", "Redis"],
        concepts: ["Machine Learning", "CI/CD", "Agile", "Microservices"]
      };

      // Extract skills from achievements
      const foundTech = {
        languages: new Set(),
        web: new Set(),
        frameworksAndTools: new Set(),
        platforms: new Set(),
        concepts: new Set()
      };

      achievements.forEach(a => {
        const text = `${a.achievementTitle} ${a.achievementDescription}`.toLowerCase();
        Object.entries(techKeywords).forEach(([category, keywords]) => {
          keywords.forEach(k => {
            if (text.includes(k.toLowerCase())) foundTech[category].add(k);
          });
        });
      });

      // Filter achievements into categories
      const education = achievements.filter(a => a.category === 'academic');
      const projects = achievements.filter(a => ['project', 'research'].includes(a.category));
      const experience = achievements.filter(a => ['internship', 'leadership'].includes(a.category));
      const awards = achievements.filter(a => ['academic', 'sports', 'arts'].includes(a.category));
      const extracurricular = achievements.filter(a => ['volunteer', 'leadership'].includes(a.category));

      // Build ATS-friendly JSON resume with some smart defaults
      const resume = {
        personalInfo: {
          name: studentName || "Student", // Use a generic fallback instead of roll number
          location: "Chennai, Tamil Nadu, India",
          email: `${rollNumber}@rajalakshmi.edu.in`,
          phone: "",
          linkedin: "", // Extract if available
          github: "", // Extract if available
          portfolio: "" // Extract if available
        },
        objective: `A motivated and results-driven computer science student at Rajalakshmi Engineering College with ${achievements.length} validated achievements. Seeking opportunities to apply technical expertise and innovative problem-solving skills in a challenging role. Demonstrated ability to deliver impactful solutions through hands-on projects and collaborative experiences.`,
        education: education.map(edu => ({
          institution: edu.issuingAuthority || "Rajalakshmi Engineering College",
          degree: edu.achievementTitle,
          score: edu.achievementDescription.match(/\d+\.?\d*/)?.[0] || "",
          scoreType: edu.achievementDescription.toLowerCase().includes('cgpa') ? 'CGPA' : 'Percentage',
          dates: edu.achievementDate
        })),
        technicalSkills: {
          languages: Array.from(foundTech.languages).length ? Array.from(foundTech.languages) : ["Python", "JavaScript"],
          web: Array.from(foundTech.web).length ? Array.from(foundTech.web) : ["HTML", "CSS", "React"],
          frameworksAndTools: Array.from(foundTech.frameworksAndTools).length ? Array.from(foundTech.frameworksAndTools) : ["Git", "VS Code"],
          platforms: Array.from(foundTech.platforms).length ? Array.from(foundTech.platforms) : ["Windows", "Linux"],
          concepts: Array.from(foundTech.concepts).length ? Array.from(foundTech.concepts) : ["Data Structures", "Algorithms"]
        },
        projects: projects.map(p => ({
          title: p.achievementTitle,
          description: p.achievementDescription,
          githubLink: "", // Extract if available
          liveLink: p.evidenceLink || "" // Use evidence link if available
        })),
        experience: experience.map(exp => ({
          organization: exp.issuingAuthority || "Rajalakshmi Engineering College",
          role: exp.achievementTitle,
          location: "Chennai, India",
          dates: exp.achievementDate,
          responsibilities: [exp.achievementDescription]
        })),
        achievements: awards.map(a => ({
          title: a.level || "Achievement",
          event: a.achievementTitle,
          details: a.achievementDescription
        })),
        extraCurricularActivities: extracurricular.map(e => ({
          role: e.achievementTitle,
          organization: e.issuingAuthority || "",
          description: e.achievementDescription
        }))
      };

      return res.status(200).json(resume);
    }
    const result = await callAzureChatCompletions(openAIDeploymentName, messages, 1500);
    const generatedMarkdown = result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content
      ? result.choices[0].message.content
      : (result.choices && result.choices[0] && result.choices[0].text) || '';

    // Send as plain text (but the text itself is Markdown)
    res.status(200).send(generatedMarkdown); 

  } catch (error) {
    console.error("Error in generateResume controller:", error);
    res.status(500).json({ message: "Server error while generating resume." });
  }
};

module.exports = {
  generateResume,
};