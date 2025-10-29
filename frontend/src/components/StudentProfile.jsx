import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import { ProfileSkeleton } from './LoadingSkeleton';
import SkillsEditor from './profile/SkillsEditor';
import EducationEditor from './profile/EducationEditor';
import CertificationsEditor from './profile/CertificationsEditor';

const StudentProfile = ({ token, toast, setView }) => {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        location: '',
        degree: '',
        institution: '',
        graduationYear: '',
        gpa: '',
        linkedin: '',
        github: '',
        portfolio: '',
        skills: [],
        education: [],
        certifications: []
    });
    const [rollNumber, setRollNumber] = useState('');

    useEffect(() => {
        // Extract roll number from token
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setRollNumber(payload.rollNumber || '');
        } catch (e) {
            console.error('Failed to parse token:', e);
        }
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/students/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched profile data:', data);
                setProfile(data);
                setFormData({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    degree: data.degree || '',
                    institution: data.institution || '',
                    graduationYear: data.graduationYear || '',
                    gpa: data.gpa || '',
                    linkedin: data.linkedin || '',
                    github: data.github || '',
                    portfolio: data.portfolio || '',
                    skills: data.skills || [],
                    education: data.education || [],
                    certifications: data.certifications || []
                });
            } else {
                toast.error('Failed to load profile data');
            }
        } catch (error) {
            toast.error('Failed to load profile: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Calculate profile completion percentage
    const calculateCompletion = () => {
        const fields = ['name', 'email', 'phone', 'location', 'degree', 'institution', 'graduationYear', 'gpa', 'linkedin', 'github', 'portfolio'];
        const filledFields = fields.filter(field => formData[field] && formData[field].trim() !== '');
        return Math.round((filledFields.length / fields.length) * 100);
    };

    const completionPercentage = calculateCompletion();

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('http://localhost:3000/api/students/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const data = await response.json();
                setProfile(data.profile);
                setFormData({
                    name: data.profile.name || '',
                    email: data.profile.email || '',
                    phone: data.profile.phone || '',
                    location: data.profile.location || '',
                    degree: data.profile.degree || '',
                    institution: data.profile.institution || '',
                    graduationYear: data.profile.graduationYear || '',
                    gpa: data.profile.gpa || '',
                    linkedin: data.profile.linkedin || '',
                    github: data.profile.github || '',
                    portfolio: data.profile.portfolio || '',
                    skills: Array.isArray(data.profile.skills) ? data.profile.skills : [],
                    education: Array.isArray(data.profile.education) ? data.profile.education : [],
                    certifications: Array.isArray(data.profile.certifications) ? data.profile.certifications : []
                });
                setIsEditing(false);
                toast.success('Profile updated successfully!');
                
                // Update token if provided
                if (data.token) {
                    localStorage.setItem('studentToken', data.token);
                }
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to update profile');
            }
        } catch (error) {
            toast.error('Failed to update profile: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-4">
                <BackButton onClick={() => setView('dashboard')} label="Back to Dashboard" />
            </div>
            {isLoading ? (
                <ProfileSkeleton />
            ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                            <p className="text-gray-400">Manage your personal information</p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span>Edit Profile</span>
                            </button>
                        )}
                    </div>
                    
                    {/* Profile Completion Bar */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-300">Profile Completion</span>
                            <span className={`text-sm font-semibold ${
                                completionPercentage === 100 ? 'text-green-400' :
                                completionPercentage >= 70 ? 'text-cyan-400' :
                                completionPercentage >= 40 ? 'text-yellow-400' :
                                'text-orange-400'
                            }`}>
                                {completionPercentage}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-500 ${
                                    completionPercentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                    completionPercentage >= 70 ? 'bg-gradient-to-r from-cyan-500 to-blue-600' :
                                    completionPercentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                    'bg-gradient-to-r from-orange-500 to-red-500'
                                }`}
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSave} className="p-6">
                    {/* Personal Information */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
                                <input
                                    type="text"
                                    value={rollNumber}
                                    disabled
                                    className="w-full bg-slate-700/30 text-gray-400 p-3 rounded-lg border border-slate-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                            Education
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Degree</label>
                                <input
                                    type="text"
                                    name="degree"
                                    value={formData.degree || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="e.g., B.Tech in CSE"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Institution</label>
                                <input
                                    type="text"
                                    name="institution"
                                    value={formData.institution || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Graduation Year</label>
                                <input
                                    type="text"
                                    name="graduationYear"
                                    value={formData.graduationYear || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="e.g., 2025"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">GPA/CGPA</label>
                                <input
                                    type="text"
                                    name="gpa"
                                    value={formData.gpa || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="e.g., 8.5"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Links */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            Professional Links
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                                <input
                                    type="url"
                                    name="linkedin"
                                    value={formData.linkedin || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                                <input
                                    type="url"
                                    name="github"
                                    value={formData.github || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="https://github.com/yourusername"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio</label>
                                <input
                                    type="url"
                                    name="portfolio"
                                    value={formData.portfolio || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="https://yourportfolio.com"
                                    className="w-full bg-slate-700/50 text-gray-200 p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mb-8">
                        <SkillsEditor
                            skills={formData.skills || []}
                            onChange={(skills) => setFormData(prev => ({ ...prev, skills }))}
                            isEditing={isEditing}
                        />
                    </div>

                    {/* Education Section */}
                    <div className="mb-8">
                        <EducationEditor
                            education={formData.education || []}
                            onChange={(education) => setFormData(prev => ({ ...prev, education }))}
                            isEditing={isEditing}
                        />
                    </div>

                    {/* Certifications Section */}
                    <div className="mb-8">
                        <CertificationsEditor
                            certifications={formData.certifications || []}
                            onChange={(certifications) => setFormData(prev => ({ ...prev, certifications }))}
                            isEditing={isEditing}
                        />
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-700">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData(profile);
                                }}
                                className="px-6 py-3 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all flex items-center space-x-2"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full border-b-2 border-white h-5 w-5"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
            )}
        </div>
    );
};

export default StudentProfile;
