import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/UI';

const LandingPage = () => {
    return (
        <div className="relative animate-fade-in pb-20">
            {/* Hero Section */}
            <div className="relative text-center py-20 lg:py-32 overflow-hidden">
                {/* Background Glow Effects Removed */}

                <div className="relative z-10 max-w-5xl mx-auto px-4">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-cyan-400 text-sm font-medium animate-fade-in-up">
                        ✨ The Future of Student Portfolios
                    </div>
                    <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter mb-6 animate-fade-in-up animation-delay-200">
                        Transform Your College <br />
                        <span className="relative inline-block">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Achievements</span>
                            <svg className="absolute left-0 w-full h-auto -bottom-2" viewBox="0 0 450 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 9.06211C88.2402 3.19224 286.97 -4.27038 448 8.06211" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" />
                            </svg>
                        </span>
                        <span> into Opportunities</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 animate-fade-in-up animation-delay-400">
                        A centralized platform for students to log their accomplishments and for administrators to validate and manage them efficiently.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up animation-delay-600">
                        <Link to="/login" className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 px-10 rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:-translate-y-1">
                            <span className="flex items-center">Get Started <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-5 h-5 ml-2" /></span>
                        </Link>
                        <Link to="/admin/login" className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 text-gray-300 font-bold py-4 px-10 rounded-xl hover:bg-slate-700/50 hover:text-white transition-all duration-300 flex items-center justify-center shadow-lg hover:-translate-y-1">
                            <span className="flex items-center">Admin Portal <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" /></span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
