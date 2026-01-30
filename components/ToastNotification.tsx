import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { triggerFeedback } from '../services/feedbackService';
import FlowPortal from './FlowPortal';

// Toast types
export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // ms, default 4000
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Hook to use toast notifications
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Provider Component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
        triggerFeedback(toast.type);
    }, []);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </ToastContext.Provider>
    );
};

// Configuration for each toast type
const toastConfig: Record<ToastType, {
    icon: typeof CheckCircle2;
    iconColor: string;
    bgTint: string;
    borderColor: string;
    progressColor: string;
}> = {
    success: {
        icon: CheckCircle2,
        iconColor: 'text-emerald-500',
        bgTint: 'rgba(240, 253, 250, 0.75)',
        borderColor: 'rgba(52, 211, 153, 0.25)',
        progressColor: 'linear-gradient(90deg, #34d399, #10b981)',
    },
    info: {
        icon: Info,
        iconColor: 'text-sky-500',
        bgTint: 'rgba(240, 249, 255, 0.75)',
        borderColor: 'rgba(56, 189, 248, 0.25)',
        progressColor: 'linear-gradient(90deg, #38bdf8, #0ea5e9)',
    },
    warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        bgTint: 'rgba(255, 251, 235, 0.75)',
        borderColor: 'rgba(251, 191, 36, 0.25)',
        progressColor: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
    },
    error: {
        icon: XCircle,
        iconColor: 'text-rose-500',
        bgTint: 'rgba(255, 241, 242, 0.75)',
        borderColor: 'rgba(251, 113, 133, 0.25)',
        progressColor: 'linear-gradient(90deg, #fb7185, #f43f5e)',
    },
};

// Individual Toast Component
interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);
    const duration = toast.duration || 4000;
    const config = toastConfig[toast.type];
    const Icon = config.icon;
    const startTimeRef = useRef(Date.now());
    const animationRef = useRef<number>();

    useEffect(() => {
        const updateProgress = () => {
            const elapsed = Date.now() - startTimeRef.current;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining > 0) {
                animationRef.current = requestAnimationFrame(updateProgress);
            } else {
                setIsExiting(true);
                setTimeout(() => onDismiss(toast.id), 300);
            }
        };

        animationRef.current = requestAnimationFrame(updateProgress);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [duration, toast.id, onDismiss]);

    const handleDismiss = () => {
        triggerFeedback('tap');
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={`
                relative w-full max-w-sm rounded-2xl p-4 mb-3
                ${isExiting ? 'toast-exit' : 'toast-enter'}
            `}
            style={{
                background: config.bgTint,
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: `1px solid ${config.borderColor}`,
                boxShadow: `
                    0 20px 50px -20px rgba(15, 23, 42, 0.25),
                    0 8px 24px -8px rgba(15, 23, 42, 0.1),
                    inset 0 1px 2px rgba(255, 255, 255, 0.4)
                `,
            }}
        >
            {/* Glass highlight */}
            <div
                className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
                style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                }}
            />

            <div className="relative flex items-start gap-3">
                {/* Icon */}
                <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${config.bgTint}, rgba(255,255,255,0.5))`,
                        border: `1px solid ${config.borderColor}`,
                    }}
                >
                    <Icon size={20} className={config.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-semibold text-slate-800 text-sm leading-tight">
                        {toast.title}
                    </p>
                    {toast.message && (
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                            {toast.message}
                        </p>
                    )}
                </div>

                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className="flex-shrink-0 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
                >
                    <X size={14} className="text-slate-400" />
                </button>
            </div>

            {/* Progress bar */}
            <div
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.05)' }}
            >
                <div
                    className="h-full rounded-full transition-none"
                    style={{
                        width: `${progress}%`,
                        background: config.progressColor,
                    }}
                />
            </div>
        </div>
    );
};

// Toast Container - Fixed position at top
interface ToastContainerProps {
    toasts: Toast[];
    onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <FlowPortal>
            <div
                className="absolute left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center pointer-events-none"
                style={{
                    top: 'calc(var(--titlebar-height) + 16px)',
                    width: 'calc(100% - 32px)',
                    maxWidth: '400px',
                }}
            >
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto w-full">
                        <ToastItem toast={toast} onDismiss={onDismiss} />
                    </div>
                ))}
            </div>
        </FlowPortal>
    );
};

export default ToastProvider;
