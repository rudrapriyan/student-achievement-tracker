import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import { Spinner, Icon } from './UI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminAnalytics = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/achievements/analytics`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch analytics.');
                const data = await response.json();

                // Process and aggregate data to handle potential duplicates and ensure numbers
                if (data.byCategory) {
                    const categoryMap = new Map();
                    data.byCategory.forEach(item => {
                        const name = item.name; // Keep original case or .toLowerCase() if needed. Let's trust backend grouping but handle duplicates if any.
                        const val = Number(item.value);
                        if (categoryMap.has(name)) {
                            categoryMap.set(name, categoryMap.get(name) + val);
                        } else {
                            categoryMap.set(name, val);
                        }
                    });

                    data.byCategory = Array.from(categoryMap, ([name, count]) => ({ name, count }));
                    console.log('Processed Chart Data:', data.byCategory);
                }

                if (data.byLevel) {
                    data.byLevel = data.byLevel.map(item => ({ ...item, value: Number(item.value) }));
                }
                setStats(data);
            } catch (err) { setError(err.message); } finally { setLoading(false); }
        };
        fetchStats();
    }, [token]);

    if (loading) return <div className="flex justify-center p-12"><Spinner size="h-12 w-12" /></div>;
    if (error) return <div className="text-center text-red-400 p-4">{error}</div>;
    if (!stats) return null;

    const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* HUD Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon path="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" className="w-8 h-8 text-cyan-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-mono mb-1">TOTAL SUBMISSIONS</h3>
                    <p className="text-4xl font-bold text-white tracking-tighter">{stats.total}</p>
                    <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 w-full animate-pulse"></div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon path="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-mono mb-1">ACCEPTED</h3>
                    <p className="text-4xl font-bold text-green-400 tracking-tighter">{stats.validated}</p>
                    <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${(stats.validated / stats.total) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon path="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-mono mb-1">PENDING REVIEW</h3>
                    <p className="text-4xl font-bold text-yellow-400 tracking-tighter">{stats.pending}</p>
                    <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${(stats.pending / stats.total) * 100}%` }}></div>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon path="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-mono mb-1">REJECTED</h3>
                    <p className="text-4xl font-bold text-red-400 tracking-tighter">{stats.rejected}</p>
                    <div className="w-full h-1 bg-slate-800 mt-4 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${(stats.rejected / stats.total) * 100}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Distribution */}
                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl overflow-hidden">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <span className="w-2 h-6 bg-cyan-500 mr-3 rounded-full"></span>
                        Achievements by Category
                    </h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.byCategory} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    type="number"
                                    stroke="#94a3b8"
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#22d3ee' }}
                                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#22d3ee"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#22d3ee', strokeWidth: 2, stroke: '#0f172a' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Level Breakdown */}
                <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                        <span className="w-2 h-6 bg-purple-500 mr-3 rounded-full"></span>
                        Breakdown by Level
                    </h3>
                    <div className="h-80 w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%" debounce={50}>
                            <PieChart>
                                <Pie
                                    data={stats.byLevel}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.byLevel.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
