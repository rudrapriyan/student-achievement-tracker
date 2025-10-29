import React, { useState, useEffect } from 'react';
import { Icon } from './components/Icon';
import { Spinner } from './components/Spinner';
import LandingPage from './components/LandingPage';
import StudentLogin from './components/StudentLogin';
import StudentSubmissionForm from './components/StudentSubmissionForm';
import ResumeGenerator from './components/ResumeGenerator';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';


function App() {
    const [view, setView] = useState(window.location.hash.replace('#', '') || 'landing'); // 'landing', 'student', 'adminLogin', 'adminDashboard', 'resume'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [token, setToken] = useState(null);
    const [studentToken, setStudentToken] = useState(null);

    useEffect(() => {
        if (error || successMessage) {
            const timer = setTimeout(() => { setError(''); setSuccessMessage(''); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, successMessage]);

    // Handle hash-based navigation
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setView(hash);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    const handleViewChange = (newView) => {
        setError(''); 
        setSuccessMessage(''); 
        setView(newView);
    };

    const handleLogout = () => {
        setToken(null);
        setStudentToken(null);
        setView('landing');
    };
    
    return (
        <div className="bg-[#0a0f1f] min-h-screen font-sans text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Inline style for autofill and markdown, should be moved to CSS file ideally */}
            <style>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active {
                    -webkit-box-shadow: 0 0 0 30px #1e293b inset !important;
                    -webkit-text-fill-color: #e5e7eb !important;
                    caret-color: #e5e7eb !important;
                }
                input[type="date"]::-webkit-calendar-picker-indicator {
                    filter: invert(1);
                    cursor: pointer;
                }
                .markdown-output h2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #22d3ee;
                    border-bottom: 1px solid #334155;
                    padding-bottom: 0.5rem;
                    margin-top: 1.5rem;
                    margin-bottom: 1rem;
                }
                .markdown-output h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #e5e7eb;
                    margin-top: 1.25rem;
                    margin-bottom: 0.75rem;
                }
                .markdown-output ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .markdown-output li {
                    margin-bottom: 0.25rem;
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
                    {studentToken && view !== 'studentLogin' && (
                        <button onClick={() => { setStudentToken(null); handleViewChange('landing'); }} className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-slate-800/80 border border-slate-700 text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 ml-4">
                            <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    )}
                </header>
                <main>
                    {view === 'landing' && <LandingPage setView={handleViewChange} studentToken={studentToken} />}
                    {view === 'studentLogin' && <StudentLogin setStudentToken={setStudentToken} setView={handleViewChange} setError={setError} setSuccessMessage={setSuccessMessage} isLoading={isLoading} setIsLoading={setIsLoading} />}
                    {view === 'student' && studentToken && <StudentSubmissionForm token={studentToken} setSuccessMessage={setSuccessMessage} setError={setError} setIsLoading={setIsLoading} isLoading={isLoading} setView={handleViewChange} />}
                    {view === 'resume' && studentToken && <ResumeGenerator token={studentToken} setSuccessMessage={setSuccessMessage} setError={setError} setIsLoading={setIsLoading} isLoading={isLoading} setView={handleViewChange} />}
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

export default App;