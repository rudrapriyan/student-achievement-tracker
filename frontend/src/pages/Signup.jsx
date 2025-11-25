import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput, Icon, Spinner } from '../components/UI';

import { API_BASE_URL } from '../api';

const Signup = () => {
    const [formData, setFormData] = useState({ name: '', email: '', rollNumber: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Signup failed.');

            login(data.user, data.token);
            navigate('/dashboard');
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-md w-full backdrop-blur-sm animate-fade-in">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Create Account</h2>
                {error && <div className="mb-4 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormInput name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                    <FormInput name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />
                    <FormInput name="rollNumber" type="text" value={formData.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
                    <FormInput name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105">
                        {isLoading ? <Spinner /> : <span className="flex items-center">Sign Up <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5 ml-2" /></span>}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-gray-400">Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Log In</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
