import React, { useState, useEffect, useCallback } from 'react';

// --- Helper Components ---

const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const Spinner = ({ size = "h-5 w-5" }) => (
    <div className={`animate-spin rounded-full border-b-2 border-t-2 border-white ${size}`}></div>
);

// --- Main Application ---

function App() {
    const [view, setView] = useState('landing'); // 'landing', 'student', 'adminLogin', 'adminDashboard'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => { setError(''); setSuccessMessage(''); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    const handleViewChange = (newView) => {
        setError(''); setSuccessMessage(''); setView(newView);
    };
    
    const handleLogout = () => {
        setToken(null);
        handleViewChange('landing');
    };

    return (
        <div className="bg-[#0a0f1f] min-h-screen font-sans text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Style override for browser autofill and date picker icon to match the dark theme */}
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #1e293b inset !important; /* slate-800 background */
                    -webkit-text-fill-color: #e5e7eb !important; /* gray-200 text */
                    caret-color: #e5e7eb !important;
                }
                /* --- THIS IS THE FIX --- */
                /* Invert the color of the calendar icon to make it visible on a dark background */
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
            `}</style>
        
            <div className="w-full max-w-6xl z-10">
                 <header className="flex justify-between items-center mb-10 pb-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-4 cursor-pointer" onClick={() => handleViewChange('landing')}>
                        <h1 className="text-2xl font-mono text-gray-100 tracking-tighter">Student <span className="text-cyan-400">Achievements Tracker</span></h1>
                    </div>
                    {token && view === 'adminDashboard' && (
                         <button onClick={handleLogout} className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-slate-800/80 border border-slate-700 text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300">
                            <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    )}
                </header>

                <main>
                    {view === 'landing' && <LandingPage setView={handleViewChange} />}
                    {view === 'student' && <StudentSubmissionForm setSuccessMessage={setSuccessMessage} setError={setError} setIsLoading={setIsLoading} isLoading={isLoading} />}
                    {view === 'adminLogin' && <AdminLogin setToken={setToken} setView={handleViewChange} setError={setError} setIsLoading={setIsLoading} isLoading={isLoading} />}
                    {view === 'adminDashboard' && <AdminDashboard token={token} setToken={setToken} setView={handleViewChange} />}
                    <div className="mt-6 w-full max-w-3xl mx-auto">
                        {error && <div className="p-4 text-center text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg shadow-lg animate-fade-in">{error}</div>}
                        {successMessage && <div className="p-4 text-center text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg shadow-lg animate-fade-in">{successMessage}</div>}
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- Landing Page Component ---
const LandingPage = ({ setView }) => {
    return (
        <div className="relative text-center py-20 animate-fade-in">
             {/* Background Glow Effects - Scoped to Landing Page */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10 opacity-50"></div>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>

            <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
                Transform Your College <br />
                <span className="relative inline-block">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Achievements</span>
                    {/* --- THIS IS THE NEW HANDWRITTEN UNDERLINE --- */}
                    <svg
                        className="absolute left-0 w-full h-auto"
                        viewBox="0 0 450 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ bottom: '-1rem' }}
                    >
                        <path
                            d="M2 9.06211C88.2402 3.19224 286.97 -4.27038 448 8.06211"
                            stroke="#22d3ee" // Tailwind cyan-400 color
                            strokeWidth="4"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
                <span> into Opportunities</span>
            </h2>
            <p className="max-w-2xl mx-auto mt-8 text-lg text-gray-400">
                A centralized platform for students to log their accomplishments and for administrators to validate and manage them efficiently.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                 <button onClick={() => setView('student')} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-10 rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105">
                    <span className="flex items-center">Log an Achievement <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5 ml-2" /></span>
                </button>
                 <button onClick={() => setView('adminLogin')} className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 text-gray-300 font-bold py-3 px-10 rounded-full hover:bg-slate-700/50 hover:text-white transition-all duration-300 flex items-center justify-center mx-auto shadow-lg">
                     <span className="flex items-center">Admin Portal <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" /></span>
                </button>
            </div>
        </div>
    );
};

// --- Form Primitives (for consistent styling) ---
const FormInput = (props) => (
    <input {...props} className="w-full bg-slate-800/50 text-gray-200 p-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 placeholder:text-gray-500" />
);
const FormSelect = (props) => (
    <select {...props} className="w-full bg-slate-800/50 text-gray-200 p-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300" />
);
const FormTextarea = (props) => (
    <textarea {...props} className="w-full bg-slate-800/50 text-gray-200 p-3 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-300 placeholder:text-gray-500 min-h-[120px]" />
);

// --- Student Submission Form Component ---
const StudentSubmissionForm = ({ setSuccessMessage, setError, setIsLoading, isLoading }) => {
    const [formData, setFormData] = useState({ studentName: '', rollNumber: '', achievementTitle: '', achievementDescription: '', category: '', level: '', achievementDate: '', issuingAuthority: '', evidenceLink: '' });
    const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccessMessage(''); setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/achievements/log', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to submit.');
            setSuccessMessage(data.message);
            setFormData({ studentName: '', rollNumber: '', achievementTitle: '', achievementDescription: '', category: '', level: '', achievementDate: '', issuingAuthority: '', evidenceLink: '' });
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-3xl mx-auto backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold mb-1 text-center text-white">Submit Your Achievement</h2>
            <p className="text-gray-400 text-center mb-8">Showcase your success. Fill out the form below.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Full Name" required />
                <FormInput name="rollNumber" value={formData.rollNumber} onChange={handleChange} placeholder="Roll Number" required />
                <div className="md:col-span-2"><FormInput name="achievementTitle" value={formData.achievementTitle} onChange={handleChange} placeholder="Achievement Title (e.g., Winner, Smart India Hackathon)" required /></div>
                <div className="md:col-span-2"><FormTextarea name="achievementDescription" value={formData.achievementDescription} onChange={handleChange} placeholder="Brief Description of your achievement..." /></div>
                <FormSelect name="category" value={formData.category} onChange={handleChange} required>
                     <option value="" className="bg-slate-800">Select Category...</option><option className="bg-slate-800">Academic Excellence</option><option className="bg-slate-800">Research & Publication</option><option className="bg-slate-800">Technical & Hackathons</option><option className="bg-slate-800">Sports</option><option className="bg-slate-800">Arts & Culture</option><option className="bg-slate-800">Leadership & Volunteering</option><option className="bg-slate-800">Internship & Placements</option>
                </FormSelect>
                <FormSelect name="level" value={formData.level} onChange={handleChange} required>
                    <option value="" className="bg-slate-800">Select Level...</option><option className="bg-slate-800">Intra-Collegiate</option><option className="bg-slate-800">State-Level</option><option className="bg-slate-800">National</option><option className="bg-slate-800">International</option>
                </FormSelect>
                <div><label className="text-xs text-gray-400 ml-1">Achievement Date</label><FormInput name="achievementDate" value={formData.achievementDate} onChange={handleChange} type="date" required /></div>
                <FormInput name="issuingAuthority" value={formData.issuingAuthority} onChange={handleChange} placeholder="Issuing Authority (e.g., IEEE)" required />
                <div className="md:col-span-2"><FormInput name="evidenceLink" value={formData.evidenceLink} onChange={handleChange} placeholder="https://example.com/evidence.pdf (Required)" required /></div>
                <div className="md:col-span-2 text-center mt-4">
                    <button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-10 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105">
                        {isLoading ? <Spinner /> : <span className="flex items-center">Submit <Icon path="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" className="w-5 h-5 ml-2" /></span>}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Admin Login Component ---
const AdminLogin = ({ setToken, setView, setError, setIsLoading, isLoading }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const handleChange = (e) => { const { name, value } = e.target; setCredentials(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed.');
            setToken(data.token); setView('adminDashboard');
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    };
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl shadow-2xl shadow-black/20 max-w-md mx-auto backdrop-blur-sm animate-fade-in">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Admin Portal</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput name="username" type="text" value={credentials.username} onChange={handleChange} placeholder="Username" required />
                <FormInput name="password" type="password" value={credentials.password} onChange={handleChange} placeholder="Password" required />
                <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-6 rounded-full hover:from-cyan-400 hover:to-blue-500 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105">
                     {isLoading ? <Spinner /> : <span className="flex items-center">Log In <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" /></span>}
                </button>
            </form>
        </div>
    );
};

// --- Admin Dashboard Component ---
const AdminDashboard = ({ token, setToken, setView }) => {
    const [achievements, setAchievements] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAchievements = useCallback(async () => {
        setIsLoading(true); setError('');
        const endpoint = filter === 'pending' ? '/api/achievements/pending' : '/api/achievements';
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.status === 403) { 
                setToken(null);
                setView('adminLogin');
                return; 
            }
            if (!response.ok) throw new Error('Failed to fetch achievements.');
            const data = await response.json();
            setAchievements(Array.isArray(data) ? data : []);
        } catch (err) { setError(err.message); } finally { setIsLoading(false); }
    }, [token, filter, setToken, setView]);

    useEffect(() => { fetchAchievements(); }, [fetchAchievements]);

    const handleStatusUpdate = async (id, status) => {
        try {
            const response = await fetch(`http://localhost:3000/api/achievements/${id}/validate`, {
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

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl shadow-black/20 backdrop-blur-sm animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white">Review Submissions</h2>
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
                                    <td className="p-4 font-medium">{ach.studentName}<br/><span className="text-xs text-gray-500 font-mono">{ach.rollNumber}</span></td>
                                    <td className="p-4">{ach.achievementTitle}<br/><span className="text-xs text-gray-400">{ach.category} ({ach.level})</span></td>
                                    <td className="p-4">
                                        {ach.evidenceLink ? (<a href={formatUrl(ach.evidenceLink)} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">View Link</a>) : <span className="text-gray-600">N/A</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            ach.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                            ach.status === 'validated' ? 'bg-green-500/10 text-green-400' :
                                            'bg-red-500/10 text-red-400'
                                        }`}>{ach.status}</span>
                                    </td>
                                    <td className="p-4">
                                        {ach.status === 'pending' && (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleStatusUpdate(ach.id, 'validated')} className="p-2 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 transition-all duration-200 transform hover:scale-110"><Icon path="M4.5 12.75l6 6 9-13.5" className="w-5 h-5"/></button>
                                                <button onClick={() => handleStatusUpdate(ach.id, 'rejected')} className="p-2 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-all duration-200 transform hover:scale-110"><Icon path="M6 18L18 6M6 6l12 12" className="w-5 h-5"/></button>
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
        </div>
    );
};

export default App;

