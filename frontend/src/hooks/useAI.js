import { useState } from 'react';

/**
 * Custom hook for AI operations
 */
export const useAI = (token) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const apiCall = async (endpoint, body) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:3000/api/ai/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'AI request failed');
            }

            return await response.json();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        error,
        
        // Achievement Description Generator
        generateDescription: async (achievementData) => {
            return await apiCall('generate-description', achievementData);
        },

        // Bullet Point Optimizer
        optimizeBullet: async (text) => {
            return await apiCall('optimize-bullet', { text });
        },

        // Resume Tailoring
        tailorResume: async (achievements, jobDescription) => {
            return await apiCall('tailor-resume', { achievements, jobDescription });
        },

        // Auto-Categorize
        categorizeAchievement: async (title, description) => {
            return await apiCall('categorize', { title, description });
        },

        // Interview Prep
        generateInterviewPrep: async (achievements) => {
            return await apiCall('interview-prep', { achievements });
        },

        // Skills Extractor
        extractSkills: async (achievements) => {
            return await apiCall('extract-skills', { achievements });
        },

        // Career Path
        generateCareerPath: async (profile, achievements) => {
            return await apiCall('career-path', { profile, achievements });
        },

        // Achievement Gaps
        analyzeGaps: async (profile, achievements) => {
            return await apiCall('analyze-gaps', { profile, achievements });
        },

        // Sentiment Analysis
        analyzeSentiment: async (items) => {
            return await apiCall('sentiment-analysis', { items });
        },

        // Chat
        chat: async (message, context) => {
            return await apiCall('chat', { message, context });
        }
    };
};

export default useAI;
