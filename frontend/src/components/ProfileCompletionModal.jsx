import React, { useState } from 'react';

const ProfileCompletionModal = ({ token, onComplete, onClose }) => {
    const [profile, setProfile] = useState({
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        degree: '',
        institution: '',
        graduationYear: '',
        gpa: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!profile.email || !profile.phone || !profile.degree || !profile.institution) {
            setError('Please fill in all required fields (Email, Phone, Degree, Institution)');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:3000/api/students/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Profile update failed:', data);
                throw new Error(data.error || data.message || 'Failed to update profile');
            }

            console.log('Profile updated successfully:', data);

            // Update token if provided
            if (data.token) {
                localStorage.setItem('studentToken', data.token);
            }

            onComplete(data);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto">
                <div className="p-6 md:p-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h2>
                    <p className="text-gray-300 mb-6">
                        To generate an ATS-friendly resume, we need a few more details about you.
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Personal Information</h3>
                            <div className="space-y-3">
                                <input
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    placeholder="Email Address *"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                                <input
                                    name="phone"
                                    type="tel"
                                    value={profile.phone}
                                    onChange={handleChange}
                                    placeholder="Phone Number *"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                                <input
                                    name="location"
                                    type="text"
                                    value={profile.location}
                                    onChange={handleChange}
                                    placeholder="Location (City, State)"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        {/* Education */}
                        <div>
                            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Education</h3>
                            <div className="space-y-3">
                                <input
                                    name="degree"
                                    type="text"
                                    value={profile.degree}
                                    onChange={handleChange}
                                    placeholder="Degree (e.g., B.Tech in CSE) *"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                                <input
                                    name="institution"
                                    type="text"
                                    value={profile.institution}
                                    onChange={handleChange}
                                    placeholder="Institution Name *"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        name="graduationYear"
                                        type="text"
                                        value={profile.graduationYear}
                                        onChange={handleChange}
                                        placeholder="Graduation Year"
                                        className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    />
                                    <input
                                        name="gpa"
                                        type="text"
                                        value={profile.gpa}
                                        onChange={handleChange}
                                        placeholder="GPA/CGPA"
                                        className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Professional Links (Optional)</h3>
                            <div className="space-y-3">
                                <input
                                    name="linkedin"
                                    type="url"
                                    value={profile.linkedin}
                                    onChange={handleChange}
                                    placeholder="LinkedIn URL"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                />
                                <input
                                    name="github"
                                    type="url"
                                    value={profile.github}
                                    onChange={handleChange}
                                    placeholder="GitHub URL"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                />
                                <input
                                    name="portfolio"
                                    type="url"
                                    value={profile.portfolio}
                                    onChange={handleChange}
                                    placeholder="Portfolio URL"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300"
                            >
                                {isLoading ? 'Saving...' : 'Save Profile'}
                            </button>
                            {onClose && (
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all duration-300"
                                >
                                    Skip for Now
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionModal;
