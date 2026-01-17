import React, { useState, useRef, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

// Long Press Button Component matching FocusTimer's LongPressButton style
interface LongPressDeleteButtonProps {
    onComplete: () => void;
    disabled?: boolean;
    duration?: number;
}

const LongPressDeleteButton: React.FC<LongPressDeleteButtonProps> = ({
    onComplete,
    disabled = false,
    duration = 1500,
}) => {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const size = 64;
    const strokeWidth = 3;
    const outerRadius = (size / 2) + 4;

    const startHolding = useCallback(() => {
        if (disabled) return;
        setIsHolding(true);
        startTimeRef.current = Date.now();

        intervalRef.current = window.setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                stopHolding();
                onComplete();
            }
        }, 16);
    }, [disabled, duration, onComplete]);

    const stopHolding = useCallback(() => {
        setIsHolding(false);
        setProgress(0);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
        <div className="flex flex-col items-center">
            {/* Container for button with outer progress ring */}
            <div className="relative" style={{ width: size + 16, height: size + 16 }}>
                {/* SVG Progress Ring - Outside the button */}
                <svg
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        width: size + 16,
                        height: size + 16,
                        transform: 'rotate(-90deg)',
                    }}
                >
                    <defs>
                        <linearGradient id="deleteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f87171" />
                            <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle
                        cx={(size + 16) / 2}
                        cy={(size + 16) / 2}
                        r={outerRadius}
                        fill="none"
                        stroke="rgba(252, 165, 165, 0.3)"
                        strokeWidth={strokeWidth}
                        style={{
                            opacity: isHolding ? 1 : 0,
                            transition: 'opacity 0.2s ease'
                        }}
                    />
                    {/* Progress */}
                    <circle
                        cx={(size + 16) / 2}
                        cy={(size + 16) / 2}
                        r={outerRadius}
                        fill="none"
                        stroke="url(#deleteGradient)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        style={{
                            strokeDasharray: 2 * Math.PI * outerRadius,
                            strokeDashoffset: 2 * Math.PI * outerRadius - (progress / 100) * 2 * Math.PI * outerRadius,
                            transition: isHolding ? 'none' : 'stroke-dashoffset 0.3s ease',
                            opacity: isHolding ? 1 : 0,
                        }}
                    />
                </svg>

                {/* Button */}
                <button
                    onMouseDown={startHolding}
                    onMouseUp={stopHolding}
                    onMouseLeave={stopHolding}
                    onTouchStart={startHolding}
                    onTouchEnd={stopHolding}
                    onTouchCancel={stopHolding}
                    disabled={disabled}
                    className={`
                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        group flex items-center justify-center
                        transition-all duration-300
                        ${isHolding ? 'scale-95' : 'hover:scale-110'}
                        active:scale-95 disabled:opacity-50
                    `}
                    style={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        background: isHolding
                            ? 'linear-gradient(135deg, rgba(254, 202, 202, 0.95), rgba(252, 165, 165, 0.85))'
                            : 'linear-gradient(135deg, rgba(254, 226, 226, 0.8), rgba(254, 202, 202, 0.6))',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(252, 165, 165, 0.4)',
                        boxShadow: isHolding
                            ? '0 6px 28px -4px rgba(239, 68, 68, 0.35), inset 0 1px 2px rgba(255,255,255,0.5)'
                            : '0 4px 24px -4px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255,255,255,0.4)',
                    }}
                    title="Hold to delete account"
                >
                    <X size={28} className="text-rose-500" strokeWidth={2.5} />
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
                Hold for {duration / 1000}s to confirm
            </p>
        </div>
    );
};

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    isOpen,
    onConfirm,
    onCancel,
    isLoading = false,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            onClick={onCancel}
        >
            <div
                className="relative w-full max-w-sm rounded-3xl p-6 animate-fade-in"
                style={{
                    background: 'rgba(255, 245, 245, 0.70)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    border: '1px solid rgba(252, 165, 165, 0.25)',
                    boxShadow: `
                        0 25px 70px -30px rgba(239, 68, 68, 0.25),
                        inset 0 1px 2px rgba(255, 255, 255, 0.4)
                    `,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
                            border: '2px solid rgba(239, 68, 68, 0.3)',
                        }}
                    >
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                    Delete Account
                </h3>

                {/* Description */}
                <p className="text-center text-slate-500 text-sm mb-2">
                    This will permanently delete your account and all data, including:
                </p>

                {/* Data list */}
                <div
                    className="rounded-xl p-3 mb-5"
                    style={{
                        background: 'rgba(241, 245, 249, 0.8)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                    }}
                >
                    <ul className="text-sm text-slate-600 space-y-1.5">
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>All focus session records</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>Tasks and schedules</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>Achievements and statistics</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span>Settings and preferences</span>
                        </li>
                    </ul>
                </div>

                {/* Long Press Delete Button */}
                <div className="flex justify-center mb-5">
                    <LongPressDeleteButton
                        onComplete={onConfirm}
                        disabled={isLoading}
                        duration={1500}
                    />
                </div>

                {/* Cancel Button */}
                <button
                    onClick={onCancel}
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: 'rgba(241, 245, 249, 0.9)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        color: '#64748b',
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default DeleteAccountModal;
