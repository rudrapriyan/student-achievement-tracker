import React from 'react';
import { Icon } from './Icon';

const LandingPage = ({ setView, studentToken }) => (
    <div className="relative text-center py-20 animate-fade-in">
        {/* Background Glow Effects */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900/10 via-transparent to-cyan-900/10 opacity-50"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>

        <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
            Transform Your College <br />
            <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">Achievements</span>
                <svg
                    className="absolute left-0 w-full h-auto"
                    viewBox="0 0 450 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ bottom: '-1rem' }}
                >
                    <path
                        d="M2 9.06211C88.2402 3.19224 286.97 -4.27038 448 8.06211"
                        stroke="#22d3ee"
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
            <button
                onClick={() => setView('studentLogin')}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 px-10 rounded-full hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/30 transform hover:scale-105"
            >
                <span className="flex items-center">
                    Student Login
                    <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" />
                </span>
            </button>
            
            {studentToken ? (
                // Show enabled resume button for logged-in students
                <button
                    onClick={() => setView('resume')}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-10 rounded-full hover:from-emerald-400 hover:to-teal-500 transition-all duration-300 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/30 transform hover:scale-105"
                >
                    <span className="flex items-center">
                        Generate Resume
                        <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" className="w-5 h-5 ml-2" />
                    </span>
                </button>
            ) : (
                // Show disabled resume button with tooltip for non-logged-in users
                <div className="relative group">
                    <button
                        disabled
                        className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 text-gray-500 font-bold py-3 px-10 rounded-full cursor-not-allowed opacity-75 flex items-center justify-center mx-auto shadow-lg"
                    >
                        <span className="flex items-center">
                            Generate Resume
                            <Icon path="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" className="w-5 h-5 ml-2" />
                        </span>
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 py-2 px-4 bg-gray-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        Please log in as a student first
                    </div>
                </div>
            )}
            
            <button
                onClick={() => setView('adminLogin')}
                className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 text-gray-300 font-bold py-3 px-10 rounded-full hover:bg-slate-700/50 hover:text-white transition-all duration-300 flex items-center justify-center mx-auto shadow-lg"
            >
                <span className="flex items-center">
                    Admin Portal
                    <Icon path="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" className="w-5 h-5 ml-2" />
                </span>
            </button>
        </div>
    </div>
);

export default LandingPage;