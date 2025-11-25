import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';
import { Card, Spinner, Icon } from '../components/UI';

const MyAchievements = () => {
    const { token } = useAuth();
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    const [sortBy, setSortBy] = useState('date');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        const fetchAchievements = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/achievements/my-achievements`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setAchievements(Array.isArray(data) ? data : []);
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchAchievements();
    }, [token]);

    const filteredAndSortedAchievements = [...achievements]
        .filter(ach => filterCategory === 'all' || ach.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.achievementDate) - new Date(a.achievementDate);
            if (sortBy === 'status') return a.status.localeCompare(b.status);
            if (sortBy === 'category') return a.category.localeCompare(b.category);
            return 0;
        });

    const categories = ['all', ...new Set(achievements.map(ach => ach.category))];

    if (loading) return <div className="flex justify-center p-12"><Spinner size="h-12 w-12" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                <h2 className="text-3xl font-bold text-white">My Achievements</h2>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-slate-900/50 text-gray-200 p-2.5 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 hover:border-slate-600 text-sm"
                        >
                            <option value="date">Date (Newest)</option>
                            <option value="status">Approval Status</option>
                            <option value="category">Category</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-medium text-gray-400 mb-1 ml-1">Filter Category</label>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full bg-slate-900/50 text-gray-200 p-2.5 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 hover:border-slate-600 text-sm"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {filteredAndSortedAchievements.length === 0 ? (
                <div className="text-center text-gray-500 py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
                    <Icon path="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No achievements found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedAchievements.map(ach => (
                        <Card key={ach.id} className="bg-slate-900/40 border-slate-700/30 hover:bg-slate-800/60 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${ach.status === 'validated' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                    ach.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                    }`}>
                                    {ach.status.toUpperCase()}
                                </div>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Icon path="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" className="w-3 h-3" />
                                    {new Date(ach.achievementDate).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1">{ach.achievementTitle}</h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{ach.achievementDescription}</p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
                                <span className="bg-white/5 px-2 py-1 rounded">{ach.category}</span>
                                <span className="bg-white/5 px-2 py-1 rounded">{ach.level}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAchievements;
