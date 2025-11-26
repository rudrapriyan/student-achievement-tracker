import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Icon } from './components/UI';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyAchievements from './pages/MyAchievements';
import SubmitAchievement from './pages/SubmitAchievement';
// We'll reuse the existing AdminDashboard logic but wrapped in a component if needed, 
// or just import it if we extracted it. Since we didn't extract AdminDashboard yet, 
// I'll quickly define a placeholder or assume we should extract it too.
// Actually, for this refactor, I'll inline the AdminDashboard logic or better, 
// I should have extracted it. Let's assume I'll extract it in the next step or 
// just paste the code here for now if it's complex.
// To keep it clean, I will extract AdminDashboard to a file in the next step. 
// For now, I'll import it (assuming it exists) to make the code clean.
import AdminDashboard from './pages/AdminDashboard';
import Chatbot from './components/Chatbot';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="flex justify-between items-center mb-10 pb-4 border-b border-slate-700/50">
            <Link to="/" className="flex items-center space-x-4 cursor-pointer">
                <h1 className="text-2xl font-mono text-gray-100 tracking-tighter">Student <span className="text-cyan-400">Achievements Tracker</span></h1>
            </Link>

            {!isLandingPage && (
                <nav className="flex items-center space-x-4">
                    {user ? (
                        <>
                            {user.role === 'student' && (
                                <>
                                    <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
                                    <Link to="/submit" className="text-gray-300 hover:text-white">Log Achievement</Link>
                                    <Link to="/my-achievements" className="text-gray-300 hover:text-white">My Achievements</Link>
                                    <Link to="/profile" className="text-gray-300 hover:text-white">Profile</Link>
                                </>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-gray-300 hover:text-white">Admin Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-slate-800/80 border border-slate-700 text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300">
                                <Icon path="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" className="w-5 h-5 mr-2" />
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="text-gray-300 hover:text-white font-semibold">Login</Link>
                    )}
                </nav>
            )}
        </header>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="bg-[#0a0f1f] min-h-screen font-sans text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
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
                    `}</style>

                    <div className="w-full max-w-6xl z-10">
                        <Navigation />
                        <main>
                            <Routes>
                                <Route path="/" element={<LandingPage />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/admin/login" element={<AdminLogin />} />
                                <Route path="/signup" element={<Signup />} />

                                {/* Student Routes */}
                                <Route path="/dashboard" element={
                                    <ProtectedRoute roles={['student']}>
                                        <Dashboard />
                                    </ProtectedRoute>
                                } />
                                <Route path="/profile" element={
                                    <ProtectedRoute roles={['student']}>
                                        <Profile />
                                    </ProtectedRoute>
                                } />
                                <Route path="/submit" element={
                                    <ProtectedRoute roles={['student']}>
                                        <SubmitAchievement />
                                    </ProtectedRoute>
                                } />
                                <Route path="/my-achievements" element={
                                    <ProtectedRoute roles={['student']}>
                                        <MyAchievements />
                                    </ProtectedRoute>
                                } />

                                {/* Admin Routes */}
                                <Route path="/admin" element={
                                    <ProtectedRoute roles={['admin']}>
                                        <AdminDashboard />
                                    </ProtectedRoute>
                                } />
                            </Routes>
                        </main>
                        {/* Global Chatbot - Visible only when logged in (Navigation handles auth check logic, but we can double check or rely on Navigation's existence implies auth context is active, but actually we need to access auth context. The Navigation component uses useAuth. We can put Chatbot inside Navigation or just here. But App doesn't have access to 'user' directly unless we wrap it. Wait, App has AuthProvider. We need a wrapper component to access context. Or we can put it in Navigation. Let's put it in Navigation for simplicity as it already has user check.) */}
                        {/* Actually, Navigation is a good place. Let's move it there. */}
                    </div>
                    <GlobalChatbot />
                </div>
            </Router>
        </AuthProvider>
    );
}

const GlobalChatbot = () => {
    const { user } = useAuth();
    if (!user) return null;
    return <Chatbot />;
};

export default App;

