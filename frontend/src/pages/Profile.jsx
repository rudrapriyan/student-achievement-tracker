import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FormInput, Spinner, Icon } from '../components/UI';

import { API_BASE_URL } from '../api';

const Profile = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState({
        name: '', phone: '', location: '', rollNumber: '',
        education: { degree: '', institute: '', cgpa: '', graduationYear: '' },
        certifications: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch profile');
                const data = await response.json();
                // Merge with defaults to ensure all fields exist
                setProfile(prev => ({
                    ...prev,
                    ...data,
                    education: { ...prev.education, ...(data.education || {}) },
                    certifications: data.certifications || []
                }));
            } catch (err) {
                console.error(err);
                // Keep default empty profile on error to prevent crash
            } finally { setLoading(false); }
        };
        fetchProfile();
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfile(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCertificationChange = (index, value) => {
        const newCerts = [...(profile.certifications || [])];
        newCerts[index] = value;
        setProfile(prev => ({ ...prev, certifications: newCerts }));
    };

    const addCertification = () => {
        setProfile(prev => ({ ...prev, certifications: [...(prev.certifications || []), ''] }));
    };

    const removeCertification = (index) => {
        const newCerts = (profile.certifications || []).filter((_, i) => i !== index);
        setProfile(prev => ({ ...prev, certifications: newCerts }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true); setMessage('');
        try {
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(profile)
            });
            if (response.ok) setMessage('Profile updated successfully!');
            else setMessage('Failed to update profile.');
        } catch (err) { setMessage('Error updating profile.'); } finally { setSaving(false); }
    };

    if (loading) return <div className="flex justify-center p-12"><Spinner size="h-12 w-12" /></div>;

    return (
        <div className="max-w-3xl mx-auto bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold text-white mb-6">My Profile</h2>
            {message && <div className={`mb-4 p-3 text-sm rounded-lg ${message.includes('success') ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput label="Name" name="name" value={profile.name} onChange={handleChange} placeholder="Full Name" />
                    <FormInput label="Phone" name="phone" value={profile.phone} onChange={handleChange} placeholder="Phone Number" />
                    <FormInput label="Location" name="location" value={profile.location} onChange={handleChange} placeholder="Location" />
                    <FormInput label="Roll Number" value={profile.rollNumber} disabled className="opacity-50 cursor-not-allowed" />
                </div>

                <h3 className="text-xl font-semibold text-cyan-400 mt-8 border-b border-slate-700 pb-2">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput name="education.degree" value={profile.education?.degree || ''} onChange={handleChange} placeholder="Degree" />
                    <FormInput name="education.institute" value={profile.education?.institute || ''} onChange={handleChange} placeholder="Institute Name" />
                    <FormInput name="education.cgpa" value={profile.education?.cgpa || ''} onChange={handleChange} placeholder="CGPA" />
                    <FormInput name="education.graduationYear" value={profile.education?.graduationYear || ''} onChange={handleChange} placeholder="Graduation Year" />
                </div>

                <h3 className="text-xl font-semibold text-cyan-400 mt-8 border-b border-slate-700 pb-2">Certifications</h3>
                {profile.certifications?.map((cert, index) => (
                    <div key={index} className="flex gap-2">
                        <FormInput value={cert} onChange={(e) => handleCertificationChange(index, e.target.value)} placeholder="Certification Name / Link" />
                        <button type="button" onClick={() => removeCertification(index)} className="text-red-400 hover:text-red-300"><Icon path="M6 18L18 6M6 6l12 12" /></button>
                    </div>
                ))}
                <button type="button" onClick={addCertification} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center">+ Add Certification</button>

                <div className="pt-6">
                    <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all duration-300">
                        {saving ? <Spinner /> : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
