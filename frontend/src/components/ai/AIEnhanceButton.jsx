import React from 'react';

const AIEnhanceButton = ({ onClick, isLoading, label = "✨ Enhance with AI", size = "md" }) => {
    const sizeClasses = {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className={`${sizeClasses[size]} bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-400 hover:to-pink-500 transition-all duration-300 flex items-center space-x-2 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50`}
        >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full border-b-2 border-white h-4 w-4"></div>
                    <span>Generating...</span>
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>{label}</span>
                </>
            )}
        </button>
    );
};

export default AIEnhanceButton;
