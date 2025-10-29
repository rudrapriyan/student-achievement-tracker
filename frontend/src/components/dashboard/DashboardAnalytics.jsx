import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import useAI from '../../hooks/useAI';

const DashboardAnalytics = ({ token, profile, achievements }) => {
    const [gapAnalysis, setGapAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const ai = useAI(token);

    useEffect(() => {
        if (profile && achievements && achievements.length > 0) {
            analyzeGaps();
        } else {
            setIsLoading(false);
        }
    }, [profile, achievements]);

    const analyzeGaps = async () => {
        try {
            const result = await ai.analyzeGaps(profile, achievements);
            setGapAnalysis(result);
        } catch (error) {
            console.error('Gap analysis error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Achievement distribution by category
    const categoryData = achievements.reduce((acc, achievement) => {
        const category = achievement.category || 'other';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }));

    // Achievement by level
    const levelData = ['international', 'national', 'state', 'district', 'college'].map(level => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count: achievements.filter(a => a.level === level).length
    }));

    // Status distribution
    const statusData = [
        { name: 'Validated', value: achievements.filter(a => a.status === 'validated').length },
        { name: 'Pending', value: achievements.filter(a => a.status === 'pending').length },
        { name: 'Rejected', value: achievements.filter(a => a.status === 'rejected').length }
    ].filter(item => item.value > 0);

    // Strength scores for radar chart
    const radarData = gapAnalysis?.strengthScore ? [
        { category: 'Academic', score: gapAnalysis.strengthScore.academic * 10 },
        { category: 'Technical', score: gapAnalysis.strengthScore.technical * 10 },
        { category: 'Leadership', score: gapAnalysis.strengthScore.leadership * 10 },
        { category: 'Social', score: gapAnalysis.strengthScore.social * 10 }
    ] : [];

    const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full border-b-2 border-cyan-500 h-12 w-12"></div>
            </div>
        );
    }

    if (achievements.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-400 text-lg">No achievement data yet</p>
                <p className="text-gray-500 text-sm mt-2">Submit achievements to see analytics</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                {gapAnalysis && (
                    <button
                        onClick={analyzeGaps}
                        className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 border border-purple-500/30 transition-all text-sm flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh Analysis</span>
                    </button>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Achievement Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Achievement by Level */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Achievement Levels</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={levelData}>
                            <XAxis dataKey="level" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                            <Bar dataKey="count" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Strength Radar Chart */}
                {radarData.length > 0 && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Strength Assessment</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#475569" />
                                <PolarAngleAxis dataKey="category" stroke="#9ca3af" />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                                <Radar name="Your Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Status Overview */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Validation Status</h3>
                    <div className="space-y-4">
                        {statusData.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className="text-white font-semibold">{item.value}</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-3">
                                    <div
                                        className={`h-3 rounded-full ${
                                            item.name === 'Validated' ? 'bg-green-500' :
                                            item.name === 'Pending' ? 'bg-yellow-500' :
                                            'bg-red-500'
                                        }`}
                                        style={{ width: `${(item.value / achievements.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Gap Analysis Results */}
            {gapAnalysis && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Achievement Gap Analysis
                    </h3>

                    {/* Missing Categories */}
                    {gapAnalysis.missingCategories && gapAnalysis.missingCategories.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">Missing Achievement Categories</h4>
                            <div className="flex flex-wrap gap-2">
                                {gapAnalysis.missingCategories.map((category, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                                    >
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {gapAnalysis.recommendations && gapAnalysis.recommendations.length > 0 && (
                        <div>
                            <h4 className="text-lg font-semibold text-purple-300 mb-3">Recommended Actions</h4>
                            <div className="space-y-3">
                                {gapAnalysis.recommendations.slice(0, 5).map((rec, index) => (
                                    <div
                                        key={index}
                                        className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-purple-500/50 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h5 className="text-white font-medium">{rec.name}</h5>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                rec.priority === 'high' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                                'bg-green-500/20 text-green-300 border border-green-500/30'
                                            }`}>
                                                {rec.priority} priority
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-2">{rec.reason}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{rec.type} • {rec.category}</span>
                                            {rec.deadline && <span>📅 {rec.deadline}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DashboardAnalytics;
