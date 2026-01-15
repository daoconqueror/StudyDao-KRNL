import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    const error = useCallback((message) => addToast(message, 'error'), [addToast]);
    const info = useCallback((message) => addToast(message, 'info'), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning'), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, info, warning }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ id, message, type, onClose }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-400" size={20} />,
        error: <XCircle className="text-rose-400" size={20} />,
        warning: <AlertCircle className="text-amber-400" size={20} />,
        info: <AlertCircle className="text-blue-400" size={20} />
    };

    const colors = {
        success: 'border-emerald-500/30 bg-emerald-500/10',
        error: 'border-rose-500/30 bg-rose-500/10',
        warning: 'border-amber-500/30 bg-amber-500/10',
        info: 'border-blue-500/30 bg-blue-500/10'
    };

    return (
        <div className={`glass-panel ${colors[type]} border rounded-xl p-4 min-w-[300px] max-w-md animate-slide-in-right flex items-start gap-3`}>
            {icons[type]}
            <p className="text-white text-sm flex-1">{message}</p>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X size={16} />
            </button>
        </div>
    );
};
