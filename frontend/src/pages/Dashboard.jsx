import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import { Card, Icon, Spinner } from '../components/UI';
import { Link } from 'react-router-dom';
import ResumeBuilder from '../components/ResumeBuilder';

const Dashboard = () => {
    const { token, user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch stats.');
                const data = await response.json();
                setStats(data);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchStats();
    }, [token]);

    if (loading) return <div className="flex justify-center p-12"><Spinner size="h-12 w-12" /></div>;
    if (error) return <div className="text-center text-red-400">{error}</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.name?.split(' ')[0]}</span>
                    </h1>
                    <p className="text-gray-400">Track your progress and manage your achievements.</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'overview' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25' : 'text-gray-400 hover:text-white'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('resume')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${activeTab === 'resume' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25' : 'text-gray-400 hover:text-white'}`}
                    >
                        Resume Builder
                    </button>
                </div>
            </div>

            {activeTab === 'resume' ? (
                <ResumeBuilder />
            ) : (
                <>
                    {/* Stats Grid - Bento Style */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(140px,auto)]">
                        {/* Total Submitted - Large Square */}
                        <Card
                            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 flex flex-col justify-center items-center relative group row-span-1"
                        >
                            <div className="mb-2 p-2 bg-cyan-500/10 rounded-full text-cyan-400 group-hover:scale-110 transition-transform duration-300 w-fit">
                                <Icon path="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" className="w-5 h-5" />
                            </div>
                            <h3 className="text-gray-400 text-lg font-medium mb-1">Total Submitted</h3>
                            <p className="text-5xl font-bold text-white tracking-tight">{stats.total}</p>
                            <div className="mt-2 text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/20 w-fit">
                                Lifetime
                            </div>
                        </Card>

                        {/* Pending Review */}
                        <Card className="bg-slate-800/50 border-slate-700/50 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-24 h-24 text-yellow-500" />
                            </div>
                            <div>
                                <div className="mb-4 p-3 bg-yellow-500/10 rounded-xl text-yellow-400 w-fit">
                                    <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-6 h-6" />
                                </div>
                                <h3 className="text-gray-400 font-medium">Pending Review</h3>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.pending}</p>
                        </Card>

                        {/* Accepted */}
                        <Card className="bg-slate-800/50 border-slate-700/50 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-24 h-24 text-green-500" />
                            </div>
                            <div>
                                <div className="mb-4 p-3 bg-green-500/10 rounded-xl text-green-400 w-fit">
                                    <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-6 h-6" />
                                </div>
                                <h3 className="text-gray-400 font-medium">Accepted</h3>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.accepted}</p>
                        </Card>

                        {/* Rejected */}
                        <Card className="bg-slate-800/50 border-slate-700/50 flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Icon path="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-24 h-24 text-red-500" />
                            </div>
                            <div>
                                <div className="mb-4 p-3 bg-red-500/10 rounded-xl text-red-400 w-fit">
                                    <Icon path="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-6 h-6" />
                                </div>
                                <h3 className="text-gray-400 font-medium">Rejected</h3>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                        </Card>
                    </div>

                    {/* Quick Actions & Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Quick Actions */}
                        <div className="lg:col-span-1 space-y-4">
                            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                            <Link to="/submit" className="block group">
                                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 rounded-xl shadow-lg shadow-cyan-500/20 transition-all duration-300 transform group-hover:scale-[1.02] group-hover:shadow-cyan-500/40 border border-white/10">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-1">Log Achievement</h4>
                                            <p className="text-cyan-100 text-sm">Submit a new entry for review</p>
                                        </div>
                                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                                            <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            <Link to="/profile" className="block group">
                                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 transition-all duration-300 hover:bg-slate-800 hover:border-slate-600 group-hover:scale-[1.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-500/10 p-3 rounded-full text-purple-400">
                                            <Icon path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">Update Profile</h4>
                                            <p className="text-gray-400 text-sm">Keep your details current</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        {/* Recent Activity Placeholder (Future Feature) */}
                        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {/* We can fetch recent achievements here later */}
                                <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                                    <div className="bg-cyan-500/10 p-2 rounded-full text-cyan-400">
                                        <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-gray-300 text-sm">You logged in to the portal.</p>
                                        <p className="text-gray-500 text-xs">Just now</p>
                                    </div>
                                </div>
                                <div className="text-center text-gray-500 text-sm py-4">
                                    More activity history coming soon.
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
// Force rebuild
