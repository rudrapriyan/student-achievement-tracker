import React, { useEffect, useState } from 'react';
import { Spinner } from './Spinner';
import { Icon } from './Icon';

const AdminDashboard = ({ token, setToken, setView }) => {
    const [achievements, setAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAchievements = async () => {
            if (!token) return;
            setIsLoading(true);
            setError('');
            try {
                const res = await fetch('https://achievement-log-cgemd7c5c4fndtdd.koreacentral-01.azurewebsites.net/api/achievements', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.status === 403) {
                    // token invalid/expired
                    setToken(null);
                    setView('adminLogin');
                    return;
                }
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Failed to fetch');
                setAchievements(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAchievements();
    }, [token, setToken, setView]);

    const handleLogout = () => {
        setToken(null);
        setView('landing');
    };

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl shadow-black/20 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                <button onClick={handleLogout} className="text-sm font-semibold bg-slate-800/80 border border-slate-700 text-gray-300 px-3 py-2 rounded-full">Logout</button>
            </div>

            {isLoading && <div className="flex justify-center p-12"><Spinner size="h-12 w-12" /></div>}
            {error && <div className="text-center text-red-300 bg-red-500/10 p-4 rounded-lg">{error}</div>}

            {!isLoading && !error && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-cyan-400 uppercase bg-slate-800/50">
                            <tr>
                                <th className="p-3">Student</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {achievements.map(a => (
                                <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="p-3">{a.studentName} <div className="text-xs text-gray-500">{a.rollNumber}</div></td>
                                    <td className="p-3">{a.achievementTitle}</td>
                                    <td className="p-3">{a.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {achievements.length === 0 && <div className="text-center text-gray-500 py-12">No achievements found.</div>}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
