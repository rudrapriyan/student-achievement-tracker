import React, { useState } from 'react';
import ProfileCompletionModal from './ProfileCompletionModal';

const StudentLogin = ({ setStudentToken, setView, toast, isLoading, setIsLoading }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [tempToken, setTempToken] = useState(null);
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        rollNumber: '',
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const endpoint = isRegistering ? '/api/students/register' : '/api/students/login';
        const requiredFields = isRegistering 
            ? ['username', 'password', 'name', 'rollNumber', 'email', 'phone', 'degree', 'institution']
            : ['username', 'password'];

        // Validate required fields
        const missingFields = requiredFields.filter(field => !form[field]);
        if (missingFields.length > 0) {
            toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isRegistering ? form : {
                    username: form.username,
                    password: form.password
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Authentication failed');
            }

            // Check if profile is complete
            if (!isRegistering && data.profileComplete === false) {
                // Show profile completion modal
                setTempToken(data.token);
                setShowProfileModal(true);
                toast.info('Please complete your profile to generate ATS-friendly resumes');
            } else {
                setStudentToken(data.token);
                toast.success(isRegistering ? 'Registration successful!' : 'Login successful!');
                setView('dashboard');
            }

        } catch (err) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProfileComplete = (data) => {
        setShowProfileModal(false);
        setStudentToken(data.token || tempToken);
        toast.success('Profile updated successfully!');
        setView('dashboard');
    };

    const handleSkipProfile = () => {
        setShowProfileModal(false);
        setStudentToken(tempToken);
        setView('dashboard');
    };

    return (
        <>
            {showProfileModal && (
                <ProfileCompletionModal
                    token={tempToken}
                    onComplete={handleProfileComplete}
                    onClose={handleSkipProfile}
                />
            )}
        <div className="bg-slate-900/50 border border-slate-800 p-6 md:p-8 rounded-xl shadow-2xl shadow-black/20 max-w-2xl mx-auto backdrop-blur-sm animate-fade-in max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">
                Student {isRegistering ? 'Registration' : 'Login'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <input
                        name="username"
                        type="text"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Username"
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                        required
                    />
                    {isRegistering && (
                        <>
                            {/* Personal Information */}
                            <div className="border-t border-slate-700 pt-4 mt-2">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Personal Information</h3>
                                <div className="space-y-3">
                                    <input
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Full Name *"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                    <input
                                        name="rollNumber"
                                        type="text"
                                        value={form.rollNumber}
                                        onChange={handleChange}
                                        placeholder="Roll Number *"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="Email Address *"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="Phone Number *"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                    <input
                                        name="location"
                                        type="text"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="Location (City, State)"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>

                            {/* Education */}
                            <div className="border-t border-slate-700 pt-4 mt-2">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Education</h3>
                                <div className="space-y-3">
                                    <input
                                        name="degree"
                                        type="text"
                                        value={form.degree}
                                        onChange={handleChange}
                                        placeholder="Degree (e.g., B.Tech in CSE) *"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                    <input
                                        name="institution"
                                        type="text"
                                        value={form.institution}
                                        onChange={handleChange}
                                        placeholder="Institution Name *"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            name="graduationYear"
                                            type="text"
                                            value={form.graduationYear}
                                            onChange={handleChange}
                                            placeholder="Graduation Year"
                                            className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        />
                                        <input
                                            name="gpa"
                                            type="text"
                                            value={form.gpa}
                                            onChange={handleChange}
                                            placeholder="GPA/CGPA"
                                            className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Links (Optional) */}
                            <div className="border-t border-slate-700 pt-4 mt-2">
                                <h3 className="text-sm font-semibold text-cyan-400 mb-3">Professional Links (Optional)</h3>
                                <div className="space-y-3">
                                    <input
                                        name="linkedin"
                                        type="url"
                                        value={form.linkedin}
                                        onChange={handleChange}
                                        placeholder="LinkedIn URL"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    />
                                    <input
                                        name="github"
                                        type="url"
                                        value={form.github}
                                        onChange={handleChange}
                                        placeholder="GitHub URL"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    />
                                    <input
                                        name="portfolio"
                                        type="url"
                                        value={form.portfolio}
                                        onChange={handleChange}
                                        placeholder="Portfolio URL"
                                        className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105"
                >
                    {isLoading ? (
                        <div className="animate-spin rounded-full border-b-2 border-white h-5 w-5"></div>
                    ) : (
                        <span>{isRegistering ? 'Register' : 'Login'}</span>
                    )}
                </button>
                <p className="text-center text-gray-400 mt-4">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold focus:outline-none"
                    >
                        {isRegistering ? 'Login here' : 'Register here'}
                    </button>
                </p>
            </form>
        </div>
        </>
    );
};

export default StudentLogin;