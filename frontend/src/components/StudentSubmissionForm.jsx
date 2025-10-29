import React, { useState } from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

const StudentSubmissionForm = ({ token, setSuccessMessage, setError, setIsLoading, isLoading, setView }) => {
    const [achievement, setAchievement] = useState({
        achievementTitle: '',
        category: 'academic', // Default category
        level: 'college',    // Default level
        description: '',
        evidenceLink: '',
        date: ''
    });

    const categories = [
        'academic',
        'research',
        'internship',
        'project',
        'competition',
        'certification',
        'sports',
        'cultural',
        'leadership',
        'volunteer'
    ];

    const levels = [
        'college',
        'state',
        'national',
        'international'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAchievement(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // endpoint should match server route: POST /api/achievements/log
            const response = await fetch('http://localhost:3000/api/achievements/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(achievement)
            });

            // Parse response safely: if server returned HTML (e.g., 404 page), avoid JSON parse error.
            const contentType = response.headers.get('content-type') || '';
            let data = null;
            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Try to read text body for debugging help
                const text = await response.text();
                throw new Error(`Unexpected server response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit achievement');
            }

            setSuccessMessage('Achievement submitted successfully!');
            setAchievement({
                achievementTitle: '',
                category: 'academic',
                level: 'college',
                description: '',
                evidenceLink: '',
                date: ''
            });
            
            // Add slight delay to show success message before navigation
            setTimeout(() => {
                setView('resume');
                if (typeof window.scrollTo === 'function') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 1500);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-3xl mx-auto backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold mb-1 text-center text-white">Log Achievement</h2>
            <p className="text-gray-400 text-center mb-8">Record your accomplishments for future reference and validation.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <input
                        name="achievementTitle"
                        value={achievement.achievementTitle}
                        onChange={handleChange}
                        placeholder="Achievement Title"
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    
                    <select
                        name="category"
                        value={achievement.category}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                    
                    <select
                        name="level"
                        value={achievement.level}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    >
                        {levels.map(lvl => (
                            <option key={lvl} value={lvl}>
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)} Level
                            </option>
                        ))}
                    </select>
                    
                    <textarea
                        name="description"
                        value={achievement.description}
                        onChange={handleChange}
                        placeholder="Detailed Description"
                        rows={4}
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    
                    <input
                        name="evidenceLink"
                        type="url"
                        value={achievement.evidenceLink}
                        onChange={handleChange}
                        placeholder="Evidence Link (Optional)"
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                    />
                    
                    <input
                        name="date"
                        type="date"
                        value={achievement.date}
                        onChange={handleChange}
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    />
                </div>

                <div className="text-center">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-10 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105"
                        >
                            {isLoading ? <Spinner /> : (
                                <span className="flex items-center">
                                    Submit Achievement
                                    <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5 ml-2" />
                                </span>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => setView('resume')}
                            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-10 rounded-full hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 transform hover:scale-105"
                        >
                            <span className="flex items-center">
                                Generate Resume
                                <Icon path="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" className="w-5 h-5 ml-2" />
                            </span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default StudentSubmissionForm;