import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput, Icon, Spinner } from '../components/UI';

import { API_BASE_URL } from '../api';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => { const { name, value } = e.target; setCredentials(prev => ({ ...prev, [name]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed.');

            login(data.user, data.token);
            navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-md w-full backdrop-blur-sm animate-fade-in">
                <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
                {error && <div className="mb-4 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormInput name="username" type="text" value={credentials.username} onChange={handleChange} placeholder="Email or Roll Number" required />
                    <FormInput name="password" type="password" value={credentials.password} onChange={handleChange} placeholder="Password" required />
                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105">
                        {isLoading ? <Spinner /> : <span className="flex items-center">Log In <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" /></span>}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-gray-400">Don't have an account? <Link to="/signup" className="text-cyan-400 hover:underline">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
