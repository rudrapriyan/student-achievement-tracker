import React from 'react';

const BackButton = ({ onClick, label = 'Back' }) => {
    return (
        <button
            onClick={onClick}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600 border border-slate-600 transition-all duration-200 group"
        >
            <svg 
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">{label}</span>
        </button>
    );
};

export default BackButton;
