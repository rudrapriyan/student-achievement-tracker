import React, { useState } from 'react';

const StudentLogin = ({ setStudentToken, setView, setError, setSuccessMessage, isLoading, setIsLoading }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        rollNumber: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isRegistering ? '/api/students/register' : '/api/students/login';
        const requiredFields = isRegistering 
            ? ['username', 'password', 'name', 'rollNumber']
            : ['username', 'password'];

        // Validate required fields
        const missingFields = requiredFields.filter(field => !form[field]);
        if (missingFields.length > 0) {
            setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
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

            setStudentToken(data.token);
            setSuccessMessage(isRegistering ? 'Registration successful!' : 'Login successful!');
            setView('student');

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-md mx-auto backdrop-blur-sm animate-fade-in">
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
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                required
                            />
                            <input
                                name="rollNumber"
                                type="text"
                                value={form.rollNumber}
                                onChange={handleChange}
                                placeholder="Roll Number"
                                className="w-full bg-slate-800/50 text-gray-200 p-3 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300"
                                required
                            />
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
    );
};

export default StudentLogin;