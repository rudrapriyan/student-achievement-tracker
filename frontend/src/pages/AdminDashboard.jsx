import React, { useState, useEffect, useCallback } from 'react';
import { Icon, Spinner } from '../components/UI';

const AdminDashboard = ({ token, setToken, setView }) => {
    // Note: In the refactored App, token comes from AuthContext, but for backward compatibility 
    // or if we pass it as props, we keep it. However, we should switch to useAuth() here too.
    // For now, I'll adapt it to use props as passed by the Route wrapper or switch to context.
    // The Route in App.jsx wraps it in ProtectedRoute but doesn't pass props.
    // So we should use useAuth().

    // Let's refactor to use useAuth
    // import { useAuth } from '../context/AuthContext';
    // const { token, logout } = useAuth();

    // But to match the previous implementation exactly first:
    // The previous implementation received token, setToken, setView.
    // In the new App.jsx, <AdminDashboard /> is rendered without props.
    // So we MUST refactor this to use AuthContext.

    return <AdminDashboardContent />;
};

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../api';
import AdminAnalytics from '../components/AdminAnalytics';

const AdminDashboardContent = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [achievements, setAchievements] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAchievements = useCallback(async () => {
        setIsLoading(true); setError('');
        const endpoint = filter === 'pending' ? '/achievements/pending' : '/achievements';
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 403) {
                logout();
                navigate('/login');
                return;
            }
            if (!response.ok) throw new Error('Failed to fetch achievements.');
            const data = await response.json();
            setAchievements(Array.isArray(data) ? data : []);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    }, [token, filter, logout, navigate]);

    useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`${API_BASE_URL}/achievements/${id}/validate`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ status })
            });
            if (!response.ok) throw new Error('Failed to update status.');
            fetchAchievements();
        } catch (err) { setError(err.message); }
    };

    const formatUrl = (url) => {
        if (!url) return '#';
        if (!url.startsWith('http://') && !url.startsWith('https://')) return `https://${url}`;
        return url;
    };

    const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'analytics'

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl shadow-black/20 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('submissions')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'submissions' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-gray-400 hover:text-white'}`}
                    >
                        Review Submissions
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'analytics' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'text-gray-400 hover:text-white'}`}
                    >
                        Analytics
                    </button>
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <AdminAnalytics />
            ) : (
                <>
                    <div className="flex justify-end mb-6">
                        <div className="p-1 bg-slate-800 border border-slate-700 rounded-full flex">
                            <button onClick={() => setFilter('pending')} className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${filter === 'pending' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>Pending</button>
                            <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${filter === 'all' ? 'bg-cyan-500 text-white' : 'text-gray-300'}`}>All</button>
                        </div>
                    </div>

                    {isLoading && <div className="flex justify-center p-12"><Spinner size="h-12 w-12" /></div>}
                    {error && <div className="text-center p-4 text-red-300 bg-red-500/10 rounded-lg">{error}</div>}

                    {!isLoading && !error && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-300">
                                <thead className="text-xs text-cyan-400 uppercase bg-slate-800/50">
                                    <tr>
                                        <th scope="col" className="p-4">Student</th><th scope="col" className="p-4">Achievement</th><th scope="col" className="p-4">Evidence</th><th scope="col" className="p-4">Status</th><th scope="col" className="p-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {achievements.map(ach => (
                                        <tr key={ach.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors duration-200">
                                            <td className="p-4 font-medium">{ach.studentName}<br /><span className="text-xs text-gray-500 font-mono">{ach.rollNumber}</span></td>
                                            <td className="p-4">{ach.achievementTitle}<br /><span className="text-xs text-gray-400">{ach.category} ({ach.level})</span></td>
                                            <td className="p-4">
                                                {ach.evidenceLink ? (<a href={formatUrl(ach.evidenceLink)} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View Link</a>) : <span className="text-gray-600">N/A</span>}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ach.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                    ach.status === 'validated' ? 'bg-green-500/10 text-green-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>{ach.status}</span>
                                            </td>
                                            <td className="p-4">
                                                {ach.status === 'pending' && (
                                                    <div className="flex justify-center space-x-2">
                                                        <button onClick={() => handleStatusUpdate(ach.id, 'validated')} className="p-2 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 transition-all duration-200 transform hover:scale-110"><Icon path="M4.5 12.75l6 6 9-13.5" className="w-5 h-5" /></button>
                                                        <button onClick={() => handleStatusUpdate(ach.id, 'rejected')} className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-all duration-200 transform hover:scale-110"><Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5" /></button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {achievements.length === 0 && <div className="text-center text-gray-500 py-12"><p className="mb-2">No achievements found.</p><p className="text-sm">When new achievements are submitted, they will appear here.</p></div>}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
