import React, { useState, useEffect } from 'react';
import { Icon } from './components/Icon';
import { Spinner } from './components/Spinner';
import LandingPage from './components/LandingPage';
import StudentLogin from './components/StudentLogin';
import StudentSubmissionForm from './components/StudentSubmissionForm';
import ResumeGenerator from './components/ResumeGenerator';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import StudentNavigation from './components/StudentNavigation';
import StudentDashboard from './components/StudentDashboard';
import StudentProfile from './components/StudentProfile';
import AchievementsManager from './components/AchievementsManager';
import ToastNotification from './components/ToastNotification';
import DiagnosticTest from './components/DiagnosticTest';
// Temporarily disabled until packages installed
// import ChatAssistant from './components/chat/ChatAssistant';
import { useToast } from './hooks/useToast';


function App() {
    const [view, setView] = useState('landing'); // 'landing', 'student', 'adminLogin', 'adminDashboard'
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState(() => localStorage.getItem('adminToken') || null);
    const [studentToken, setStudentToken] = useState(() => localStorage.getItem('studentToken') || null);
    const { toasts, removeToast, toast } = useToast();

    // Persist tokens to localStorage
    useEffect(() => {
        if (token) {
            localStorage.setItem('adminToken', token);
        } else {
            localStorage.removeItem('adminToken');
        }
    }, [token]);

    useEffect(() => {
        if (studentToken) {
            localStorage.setItem('studentToken', studentToken);
        } else {
            localStorage.removeItem('studentToken');
        }
    }, [studentToken]);

    // Auto-navigate based on stored tokens
    useEffect(() => {
        if (studentToken && view === 'landing') {
            setView('dashboard');
        } else if (token && view === 'landing') {
            setView('adminDashboard');
        }
    }, []);


    // Handle hash-based navigation and browser back/forward
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash) {
                setView(hash);
            }
        };

        const handlePopState = (event) => {
            if (event.state && event.state.view) {
                setView(event.state.view);
            } else {
                const hash = window.location.hash.replace('#', '') || 'landing';
                setView(hash);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const handleViewChange = (newView) => {
        setView(newView);
        // Update URL hash for browser navigation
        window.history.pushState({ view: newView }, '', `#${newView}`);
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        setToken(null);
        setStudentToken(null);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('studentToken');
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
                {/* Show hamburger menu only for student views */}
                {studentToken && !['landing', 'studentLogin'].includes(view) && (
                    <StudentNavigation 
                        currentView={view}
                        setView={handleViewChange}
                        onLogout={handleLogout}
                        userName={(() => {
                            try {
                                const payload = JSON.parse(atob(studentToken.split('.')[1]));
                                return payload.name || payload.username || 'Student';
                            } catch {
                                return 'Student';
                            }
                        })()}
                    />
                )}

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
                    {view === 'landing' && <LandingPage setView={handleViewChange} studentToken={studentToken} />}
                    {view === 'studentLogin' && <StudentLogin setStudentToken={setStudentToken} setView={handleViewChange} toast={toast} isLoading={isLoading} setIsLoading={setIsLoading} />}
                    {view === 'dashboard' && studentToken && <StudentDashboard token={studentToken} setView={handleViewChange} />}
                    {view === 'profile' && studentToken && <StudentProfile token={studentToken} toast={toast} setView={handleViewChange} />}
                    {view === 'achievements' && studentToken && <AchievementsManager token={studentToken} toast={toast} setView={handleViewChange} />}
                    {view === 'student' && studentToken && <StudentSubmissionForm token={studentToken} toast={toast} setIsLoading={setIsLoading} isLoading={isLoading} setView={handleViewChange} />}
                    {view === 'resume' && studentToken && <ResumeGenerator token={studentToken} toast={toast} setIsLoading={setIsLoading} isLoading={isLoading} setView={handleViewChange} />}
                    {view === 'diagnostic' && studentToken && <DiagnosticTest token={studentToken} />}
                    {view === 'adminLogin' && <AdminLogin setToken={setToken} setView={handleViewChange} toast={toast} setIsLoading={setIsLoading} isLoading={isLoading} />}
                    {view === 'adminDashboard' && <AdminDashboard token={token} setToken={setToken} setView={handleViewChange} />}
                </main>
                
                {/* Toast Notifications */}
                <ToastNotification toasts={toasts} removeToast={removeToast} />
                
                {/* AI Chat Assistant temporarily disabled */}
                {/* {studentToken && <ChatAssistant token={studentToken} profile={{}} achievements={[]} />} */}
            </div>
        </div>
    );
}

export default App;