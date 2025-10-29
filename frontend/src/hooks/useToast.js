import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
        const id = toastId++;
        const newToast = { id, type, title, message, duration };
        
        // Schedule state update after current render to avoid React warning
        setTimeout(() => {
            setToasts((prev) => [...prev, newToast]);
        }, 0);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        // Schedule removal to avoid updates during render of child components
        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 0);
    }, []);

    const toast = {
        success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
        error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
        warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
        info: (message, title = 'Info') => addToast({ type: 'info', title, message }),
    };

    return { toasts, addToast, removeToast, toast };
};
