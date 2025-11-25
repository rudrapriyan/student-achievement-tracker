import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FormInput, FormSelect, FormTextarea, Spinner, Icon } from '../components/UI';

import { API_BASE_URL } from '../api';

const SubmitAchievement = () => {
    const { user, token } = useAuth();
    const [formData, setFormData] = useState({
        studentName: user?.name || '',
        rollNumber: user?.username || '', // Assuming username is rollNumber
        achievementTitle: '',
        achievementDescription: '',
        category: '',
        level: '',
        achievementDate: '',
        issuingAuthority: '',
        evidenceLink: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setMessage(''); setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/achievements/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit.');
            setMessage(data.message);
            // Reset form but keep user details
            setFormData(prev => ({ ...prev, achievementTitle: '', achievementDescription: '', category: '', level: '', achievementDate: '', issuingAuthority: '', evidenceLink: '' }));
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-3xl mx-auto backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold mb-1 text-center text-white">Submit Your Achievement</h2>
            <p className="text-gray-400 text-center mb-8">Showcase your success. Fill out the form below.</p>
            {message && <div className="mb-4 p-3 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg text-center">{message}</div>}
            {error && <div className="mb-4 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Full Name" required />
                <FormInput name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
                <div className="md:col-span-2"><FormInput name="achievementTitle" value={formData.achievementTitle} onChange={handleChange} placeholder="Achievement Title (e.g., Winner, Smart India Hackathon)" required /></div>
                <div className="md:col-span-2"><FormTextarea name="achievementDescription" value={formData.achievementDescription} onChange={handleChange} placeholder="Brief Description of your achievement..." /></div>
                <FormSelect name="category" value={formData.category} onChange={handleChange} required>
                    <option value="" className="bg-slate-800">Select Category...</option><option className="bg-slate-800">Academic Excellence</option><option className="bg-slate-800">Research & Publication</option><option className="bg-slate-800">Technical & Hackathons</option><option className="bg-slate-800">Sports</option><option className="bg-slate-800">Arts & Culture</option><option className="bg-slate-800">Leadership & Volunteering</option><option className="bg-slate-800">Internship & Placements</option>
                </FormSelect>
                <FormSelect name="level" value={formData.level} onChange={handleChange} required>
                    <option value="" className="bg-slate-800">Select Level...</option><option className="bg-slate-800">Intra-Collegiate</option><option className="bg-slate-800">State-Level</option><option className="bg-slate-800">National</option><option className="bg-slate-800">International</option>
                </FormSelect>
                <div><label className="text-xs text-gray-400 ml-1">Achievement Date</label><FormInput name="achievementDate" value={formData.achievementDate} onChange={handleChange} type="date" required /></div>
                <FormInput name="issuingAuthority" value={formData.issuingAuthority} onChange={handleChange} placeholder="Issuing Authority (e.g., IEEE)" required />
                <div className="md:col-span-2"><FormInput name="evidenceLink" value={formData.evidenceLink} onChange={handleChange} placeholder="https://example.com/evidence.pdf (Required)" required /></div>
                <div className="md:col-span-2 text-center mt-4">
                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-10 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105">
                        {isLoading ? <Spinner /> : <span className="flex items-center">Submit <Icon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="w-5 h-5 ml-2" /></span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitAchievement;
