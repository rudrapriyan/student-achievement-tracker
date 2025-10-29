import React, { useState, useEffect } from 'react';
import { StatsSkeleton } from './LoadingSkeleton';
// DashboardAnalytics temporarily disabled - requires recharts package
// import DashboardAnalytics from './dashboard/DashboardAnalytics';

const StudentDashboard = ({ token, setView }) => {
    const [stats, setStats] = useState({
        totalAchievements: 0,
        validatedAchievements: 0,
        pendingAchievements: 0
    });
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState('Student');
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [allAchievements, setAllAchievements] = useState([]);

    useEffect(() => {
        // Extract name from token as fallback
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserName(payload.name || payload.username || 'Student');
        } catch (e) {
            console.error('Failed to parse token:', e);
        }
        fetchDashboardData();
    }, [token]);

    const fetchDashboardData = async () => {
        try {
            // Fetch profile
            const profileRes = await fetch('http://localhost:3000/api/students/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
            } else {
                console.error('Failed to fetch profile:', await profileRes.text());
            }

            // Fetch achievements
            const achRes = await fetch('http://localhost:3000/api/achievements/student', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (achRes.ok) {
                const achievements = await achRes.json();
                console.log('Dashboard achievements:', achievements);
                setStats({
                    totalAchievements: achievements.length,
                    validatedAchievements: achievements.filter(a => a.status === 'validated').length,
                    pendingAchievements: achievements.filter(a => a.status === 'pending').length
                });
                // Store all achievements for analytics
                setAllAchievements(achievements);
                // Get latest 3 achievements
                setRecentAchievements(achievements.slice(0, 3));
            } else {
                console.error('Failed to fetch achievements:', await achRes.text());
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        { 
            title: 'Submit Achievement', 
            description: 'Add a new achievement to your profile',
            icon: 'M12 4v16m8-8H4',
            action: () => setView('student'),
            color: 'from-cyan-500 to-blue-600',
            hoverColor: 'hover:border-cyan-500/50'
        },
        { 
            title: 'My Achievements', 
            description: 'View and manage your achievements',
            icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
            action: () => setView('achievements'),
            color: 'from-purple-500 to-pink-600',
            hoverColor: 'hover:border-purple-500/50'
        },
        { 
            title: 'Generate Resume', 
            description: 'Create ATS-friendly resume',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            action: () => setView('resume'),
            color: 'from-green-500 to-emerald-600',
            hoverColor: 'hover:border-green-500/50'
        },
        { 
            title: 'Edit Profile', 
            description: 'Update your personal information',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            action: () => setView('profile'),
            color: 'from-orange-500 to-red-600',
            hoverColor: 'hover:border-orange-500/50'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {profile?.name || userName}! 👋
                </h1>
                <p className="text-gray-400">Here's what's happening with your achievements</p>
            </div>

            {/* Stats Cards */}
            {isLoading ? (
                <StatsSkeleton />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Total Achievements</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats.totalAchievements}</p>
                        </div>
                        <div className="bg-cyan-500/20 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Validated</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats.validatedAchievements}</p>
                        </div>
                        <div className="bg-green-500/20 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 border border-yellow-500/30 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Pending Review</p>
                            <p className="text-3xl font-bold text-white mt-2">{stats.pendingAchievements}</p>
                        </div>
                        <div className="bg-yellow-500/20 p-3 rounded-lg">
                            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.action}
                            className={`group bg-slate-800/50 border border-slate-700 rounded-xl p-6 ${action.hoverColor} transition-all duration-300 text-left hover:shadow-lg`}
                        >
                            <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                                </svg>
                            </div>
                            <h3 className={`text-lg font-semibold text-white transition-colors mb-2 ${
                                index === 0 ? 'group-hover:text-cyan-400' :
                                index === 1 ? 'group-hover:text-purple-400' :
                                index === 2 ? 'group-hover:text-green-400' :
                                'group-hover:text-orange-400'
                            }`}>
                                {action.title}
                            </h3>
                            <p className="text-sm text-gray-400">{action.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Completion */}
            {profile && !profile.profileComplete && (
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 mb-8">
                    <div className="flex items-start space-x-4">
                        <div className="bg-orange-500/20 p-3 rounded-lg">
                            <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-2">Complete Your Profile</h3>
                            <p className="text-gray-400 mb-4">
                                Your profile is incomplete. Complete it to generate ATS-friendly resumes.
                            </p>
                            <button
                                onClick={() => setView('profile')}
                                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-lg hover:from-orange-400 hover:to-red-500 transition-all duration-200"
                            >
                                Complete Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Achievements */}
            {!isLoading && recentAchievements.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white">Recent Achievements</h2>
                        <button
                            onClick={() => setView('achievements')}
                            className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center space-x-1 transition-colors"
                        >
                            <span>View All</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentAchievements.map((achievement) => {
                            const hoverBorder = achievement.status === 'validated'
                                ? 'hover:border-green-500/40'
                                : achievement.status === 'pending'
                                    ? 'hover:border-yellow-500/40'
                                    : 'hover:border-red-500/40';
                            return (
                            <div
                                key={achievement.id}
                                className={`bg-slate-800/50 border border-slate-700 rounded-xl p-4 transition-all cursor-pointer ${hoverBorder}`}
                                onClick={() => setView('achievements')}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold text-white text-sm line-clamp-2">{achievement.achievementTitle}</h3>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex-shrink-0 ml-2 ${
                                        achievement.status === 'validated' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                        achievement.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                        'bg-red-500/20 text-red-400 border-red-500/30'
                                    }`}>
                                        {achievement.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs line-clamp-2 mb-3">{achievement.achievementDescription}</p>
                                <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span className="flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        {achievement.category}
                                    </span>
                                    <span className="flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {achievement.achievementDate}
                                    </span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Analytics Section */}
            {!isLoading && allAchievements.length > 0 && (
                <div className="mt-8">
                    {/* DashboardAnalytics temporarily disabled - requires recharts package */}
                    {/* <DashboardAnalytics 
                        token={token} 
                        profile={profile} 
                        achievements={allAchievements} 
                    /> */}
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;
