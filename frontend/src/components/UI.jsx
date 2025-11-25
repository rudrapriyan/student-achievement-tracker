import React from 'react';

export const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

export const Spinner = ({ size = "h-5 w-5" }) => (
    <div className={`animate-spin rounded-full border-b-2 border-t-2 border-white ${size}`}></div>
);

export const Card = ({ children, className = "", title, subtitle, icon, colSpan = "col-span-1", rowSpan = "row-span-1" }) => (
    <div className={`glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-white/10 hover:shadow-cyan-500/5 group relative overflow-hidden ${colSpan} ${rowSpan} ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        {title && (
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                </div>
                {icon && <div className="p-2 bg-white/5 rounded-lg text-gray-300 group-hover:text-white group-hover:bg-white/10 transition-all">{icon}</div>}
            </div>
        )}
        <div className="relative z-10 h-full">{children}</div>
    </div>
);

export const Button = ({ children, variant = "primary", className = "", isLoading, ...props }) => {
    const baseStyles = "relative overflow-hidden font-bold py-3 px-6 rounded-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5",
        secondary: "bg-slate-800/50 border border-slate-700 text-gray-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600",
        danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
    };

    return (
        <button className={`${baseStyles} ${variants[variant]} ${className}`} disabled={isLoading} {...props}>
            {isLoading ? <Spinner /> : children}
        </button>
    );
};

export const FormInput = (props) => (
    <div className="group">
        {props.label && <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 group-focus-within:text-cyan-400 transition-colors">{props.label}</label>}
        <input {...props} className={`w-full bg-slate-900/50 text-gray-200 p-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 placeholder:text-gray-600 hover:border-slate-600 ${props.className}`} />
    </div>
);

export const FormSelect = (props) => (
    <div className="group">
        {props.label && <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 group-focus-within:text-cyan-400 transition-colors">{props.label}</label>}
        <select {...props} className={`w-full bg-slate-900/50 text-gray-200 p-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 hover:border-slate-600 ${props.className}`} />
    </div>
);

export const FormTextarea = (props) => (
    <div className="group">
        {props.label && <label className="block text-xs font-medium text-gray-400 mb-1 ml-1 group-focus-within:text-cyan-400 transition-colors">{props.label}</label>}
        <textarea {...props} className={`w-full bg-slate-900/50 text-gray-200 p-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none transition-all duration-300 placeholder:text-gray-600 min-h-[120px] hover:border-slate-600 ${props.className}`} />
    </div>
);
