import React, { useState } from 'react';
import { Spinner } from './Spinner';
import { Icon } from './Icon';

const AdminLogin = ({ setToken, setView, setError, setIsLoading, isLoading }) => {
    const [form, setForm] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch('https://achievement-log-cgemd7c5c4fndtdd.koreacentral-01.azurewebsites.net/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');
            setToken(data.token);
            setView('adminDashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-md mx-auto backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Admin Login</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <input
                    name="username"
                    type="text"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Admin username"
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

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg"
                >
                    {isLoading ? <Spinner size="h-5 w-5" /> : <span className="flex items-center">Log In <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" /></span>}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
