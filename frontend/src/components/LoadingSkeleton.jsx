import React from 'react';

// Generic Skeleton Component
export const Skeleton = ({ className = '', width, height }) => {
    return (
        <div 
            className={`animate-pulse bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 bg-[length:200%_100%] rounded ${className}`}
            style={{ width, height, animation: 'shimmer 2s infinite' }}
        />
    );
};

// Card Skeleton
export const CardSkeleton = () => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="flex space-x-2">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-28" />
            </div>
        </div>
    );
};

// Profile Skeleton
export const ProfileSkeleton = () => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-b border-slate-700 p-6">
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Dashboard Stats Skeleton
export const StatsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-10 w-20" />
                        </div>
                        <Skeleton className="h-14 w-14 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// List Skeleton (for achievements)
export const ListSkeleton = ({ count = 3 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
};

// Add shimmer animation to document
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
    `;
    document.head.appendChild(style);
}

export default { Skeleton, CardSkeleton, ProfileSkeleton, StatsSkeleton, ListSkeleton };
