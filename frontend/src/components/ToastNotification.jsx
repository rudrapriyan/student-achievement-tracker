import React, { useEffect, useState } from 'react';

const ToastNotification = ({ toasts, removeToast }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

const Toast = ({ toast, removeToast }) => {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const duration = toast.duration || 5000;
        const interval = 50;
        const decrement = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - decrement;
                if (newProgress <= 0) {
                    clearInterval(timer);
                    removeToast(toast.id);
                    return 0;
                }
                return newProgress;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [toast.id, toast.duration, removeToast, isPaused]);

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return {
                    border: 'border-green-500/50',
                    bg: 'bg-green-500/10',
                    text: 'text-green-400',
                    progress: 'bg-green-500',
                    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                };
            case 'error':
                return {
                    border: 'border-red-500/50',
                    bg: 'bg-red-500/10',
                    text: 'text-red-400',
                    progress: 'bg-red-500',
                    icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                };
            case 'warning':
                return {
                    border: 'border-yellow-500/50',
                    bg: 'bg-yellow-500/10',
                    text: 'text-yellow-400',
                    progress: 'bg-yellow-500',
                    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                };
            case 'info':
                return {
                    border: 'border-cyan-500/50',
                    bg: 'bg-cyan-500/10',
                    text: 'text-cyan-400',
                    progress: 'bg-cyan-500',
                    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                };
            default:
                return {
                    border: 'border-slate-500/50',
                    bg: 'bg-slate-500/10',
                    text: 'text-slate-400',
                    progress: 'bg-slate-500',
                    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                };
        }
    };

    const styles = getStyles();

    return (
        <div
            className={`${styles.bg} ${styles.border} border backdrop-blur-md rounded-lg shadow-2xl overflow-hidden transform transition-all duration-300 animate-slide-in-right min-w-[320px] max-w-md`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="p-4 flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <svg className={`w-6 h-6 ${styles.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.icon} />
                    </svg>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {toast.title && (
                        <p className={`font-semibold ${styles.text} mb-1`}>{toast.title}</p>
                    )}
                    <p className="text-sm text-gray-300">{toast.message}</p>
                </div>

                {/* Close Button */}
                <button
                    onClick={() => removeToast(toast.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close notification"
                    title="Close notification"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-slate-700/30">
                <div
                    className={`h-full ${styles.progress} transition-all duration-50 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slide-in-right {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-out;
    }
`;
document.head.appendChild(style);

export default ToastNotification;
