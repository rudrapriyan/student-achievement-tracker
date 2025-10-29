import React, { useState, useEffect } from 'react';
import BackButton from './BackButton';
import { ListSkeleton } from './LoadingSkeleton';

const AchievementsManager = ({ token, toast, setView }) => {
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');

    useEffect(() => {
        fetchAchievements();
    }, [token]);

    const fetchAchievements = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/achievements/student', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAchievements(data);
            } else {
                toast.error('Failed to load achievements');
            }
        } catch (error) {
            toast.error('Failed to load achievements: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (achievement) => {
        setEditingId(achievement.id);
        setEditForm({
            achievementTitle: achievement.achievementTitle,
            achievementDescription: achievement.achievementDescription,
            category: achievement.category,
            level: achievement.level,
            achievementDate: achievement.achievementDate,
            issuingAuthority: achievement.issuingAuthority
        });
    };

    const handleSave = async (id) => {
        setIsSaving(true);
        try {
            console.log('Saving achievement:', id, editForm);
            const response = await fetch(`http://localhost:3000/api/achievements/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editForm)
            });

            const data = await response.json();
            console.log('Save response:', data);

            if (response.ok) {
                toast.success('Achievement updated successfully! It will be re-validated by admin.');
                setEditingId(null);
                await fetchAchievements();
            } else {
                toast.error(data.message || 'Failed to update achievement');
                console.error('Save failed:', data);
            }
        } catch (error) {
            toast.error('Failed to update achievement: ' + error.message);
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this achievement?')) return;

        try {
            const response = await fetch(`http://localhost:3000/api/achievements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success('Achievement deleted successfully');
                fetchAchievements();
            } else {
                toast.error('Failed to delete achievement');
            }
        } catch (error) {
            toast.error('Failed to delete achievement: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            validated: 'bg-green-500/20 text-green-400 border-green-500/30',
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        return styles[status] || styles.pending;
    };

    // Filter, search, and sort achievements
    const filteredAchievements = achievements
        .filter(achievement => {
            // Status filter
            if (statusFilter !== 'all' && achievement.status !== statusFilter) {
                return false;
            }
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    achievement.achievementTitle?.toLowerCase().includes(query) ||
                    achievement.achievementDescription?.toLowerCase().includes(query) ||
                    achievement.category?.toLowerCase().includes(query) ||
                    achievement.level?.toLowerCase().includes(query)
                );
            }
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.achievementDate || b.createdAt) - new Date(a.achievementDate || a.createdAt);
                case 'title':
                    return (a.achievementTitle || '').localeCompare(b.achievementTitle || '');
                case 'status':
                    return (a.status || '').localeCompare(b.status || '');
                case 'category':
                    return (a.category || '').localeCompare(b.category || '');
                default:
                    return 0;
            }
        });

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-4">
                <BackButton onClick={() => setView('dashboard')} label="Back to Dashboard" />
            </div>
            
            {isLoading ? (
                <div>
                    <div className="mb-8">
                        <div className="h-10 w-64 bg-slate-700 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-96 bg-slate-700 animate-pulse rounded"></div>
                    </div>
                    <ListSkeleton count={5} />
                </div>
            ) : (
                <>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">My Achievements</h1>
                <p className="text-gray-400 mb-6">View, edit, and manage your achievements</p>

                {/* Search and Filter Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Search Bar */}
                    <div className="flex-1">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search achievements..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 text-gray-200 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 text-gray-200 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="validated">Validated</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Sort Options */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 text-gray-200 rounded-lg border border-slate-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="title">Sort by Title</option>
                        <option value="status">Sort by Status</option>
                        <option value="category">Sort by Category</option>
                    </select>
                </div>

                {/* Results Count */}
                <p className="text-sm text-gray-400 mb-4">
                    Showing {filteredAchievements.length} of {achievements.length} achievements
                </p>
            </div>

            {filteredAchievements.length === 0 ? (
                <div className="text-center py-12 bg-slate-800/50 border border-slate-700 rounded-xl">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 text-lg">No achievements yet</p>
                    <p className="text-gray-500 text-sm mt-2">Submit your first achievement to get started</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAchievements.map((achievement) => (
                        <div
                            key={achievement.id}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/30 transition-all"
                        >
                            {editingId === achievement.id ? (
                                // Edit Mode
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editForm.achievementTitle}
                                        onChange={(e) => setEditForm({ ...editForm, achievementTitle: e.target.value })}
                                        className="w-full bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        placeholder="Achievement Title"
                                    />
                                    <textarea
                                        value={editForm.achievementDescription}
                                        onChange={(e) => setEditForm({ ...editForm, achievementDescription: e.target.value })}
                                        className="w-full bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        rows="3"
                                        placeholder="Description"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            className="bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        >
                                            <option value="academic">Academic</option>
                                            <option value="project">Project</option>
                                            <option value="internship">Internship</option>
                                            <option value="research">Research</option>
                                            <option value="leadership">Leadership</option>
                                            <option value="sports">Sports</option>
                                            <option value="arts">Arts</option>
                                            <option value="volunteer">Volunteer</option>
                                        </select>
                                        <select
                                            value={editForm.level}
                                            onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                                            className="bg-slate-700/50 text-white p-3 rounded-lg border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                        >
                                            <option value="international">International</option>
                                            <option value="national">National</option>
                                            <option value="state">State</option>
                                            <option value="district">District</option>
                                            <option value="college">College</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            disabled={isSaving}
                                            className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleSave(achievement.id)}
                                            disabled={isSaving}
                                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {isSaving ? (
                                                <>
                                                    <div className="animate-spin rounded-full border-b-2 border-white h-4 w-4"></div>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-sm text-orange-400 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        Note: Edited achievements will require admin re-validation
                                    </p>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-xl font-semibold text-white">{achievement.achievementTitle}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(achievement.status)}`}>
                                                    {achievement.status.charAt(0).toUpperCase() + achievement.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="text-gray-400">{achievement.achievementDescription}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(achievement)}
                                                className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all"
                                                title="Edit"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(achievement.id)}
                                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                                                title="Delete"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            {achievement.category}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                            </svg>
                                            {achievement.level}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {achievement.achievementDate}
                                        </span>
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            {achievement.issuingAuthority}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
            </>
            )}
        </div>
    );
};

export default AchievementsManager;
