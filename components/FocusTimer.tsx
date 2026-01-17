import React, { useState, useRef, useCallback } from 'react';
import { Clock, CheckCircle2, RotateCcw, X } from 'lucide-react';

type OrbState = 'idle' | 'forming' | 'running' | 'dissolving';

// Long Press Button Component with circular progress ring
interface LongPressButtonProps {
    onComplete: () => void;
    disabled?: boolean;
    size?: number;
    duration?: number;
    icon: React.ReactNode;
    title: string;
    variant: 'reset' | 'danger';
}

const LongPressButton: React.FC<LongPressButtonProps> = ({
    onComplete,
    disabled = false,
    size = 48,
    duration = 1200,
    icon,
    title,
    variant
}) => {
    const [progress, setProgress] = useState(0);
    const [isHolding, setIsHolding] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const getColors = () => {
        if (variant === 'danger') {
            return {
                bgGradient: 'linear-gradient(135deg, rgba(254, 226, 226, 0.8), rgba(254, 202, 202, 0.6))',
                border: '1px solid rgba(252, 165, 165, 0.4)',
                shadow: '0 4px 24px -4px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255,255,255,0.4)',
                progressStroke: 'url(#dangerGradient)',
                trackStroke: 'rgba(252, 165, 165, 0.3)',
                holdBg: 'linear-gradient(135deg, rgba(254, 202, 202, 0.95), rgba(252, 165, 165, 0.85))',
                holdShadow: '0 6px 28px -4px rgba(239, 68, 68, 0.35), inset 0 1px 2px rgba(255,255,255,0.5)'
            };
        }
        return {
            bgGradient: 'linear-gradient(135deg, rgba(241, 245, 249, 0.9), rgba(226, 232, 240, 0.7))',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            shadow: '0 4px 20px -4px rgba(15, 23, 42, 0.1), inset 0 1px 2px rgba(255,255,255,0.6)',
            progressStroke: 'url(#resetGradient)',
            trackStroke: 'rgba(148, 163, 184, 0.3)',
            holdBg: 'linear-gradient(135deg, rgba(226, 232, 240, 0.95), rgba(203, 213, 225, 0.85))',
            holdShadow: '0 6px 28px -4px rgba(15, 23, 42, 0.2), inset 0 1px 2px rgba(255,255,255,0.7)'
        };
    };

    const colors = getColors();
    const strokeWidth = 3;
    const radius = (size / 2) - strokeWidth - 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

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

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return (
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
                    <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="resetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#64748b" />
                        <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                </defs>
                {/* Track */}
                <circle
                    cx={(size + 16) / 2}
                    cy={(size + 16) / 2}
                    r={(size / 2) + 4}
                    fill="none"
                    stroke={colors.trackStroke}
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
                    r={(size / 2) + 4}
                    fill="none"
                    stroke={colors.progressStroke}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: 2 * Math.PI * ((size / 2) + 4),
                        strokeDashoffset: 2 * Math.PI * ((size / 2) + 4) - (progress / 100) * 2 * Math.PI * ((size / 2) + 4),
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
                    background: isHolding ? colors.holdBg : colors.bgGradient,
                    backdropFilter: 'blur(12px)',
                    border: colors.border,
                    boxShadow: isHolding ? colors.holdShadow : colors.shadow,
                }}
                title={`Hold to ${title}`}
            >
                {/* Icon */}
                <div className={`relative z-10 transition-transform duration-500 ${isHolding ? '' : 'group-hover:rotate-180'}`}>
                    {icon}
                </div>
            </button>
        </div>
    );
};

// Session End Confirmation Modal
interface SessionEndModalProps {
    isOpen: boolean;
    elapsedTime: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const SessionEndModal: React.FC<SessionEndModalProps> = ({
    isOpen,
    elapsedTime,
    onConfirm,
    onCancel,
}) => {
    const isValidSession = elapsedTime >= 60; // 1 minute minimum

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}h ${mins}m ${secs}s`;
        }
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    };

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
                    background: isValidSession
                        ? 'rgba(240, 253, 250, 0.65)'  // Emerald tinted glass
                        : 'rgba(255, 251, 235, 0.65)', // Amber tinted glass
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    border: isValidSession
                        ? '1px solid rgba(52, 211, 153, 0.25)'
                        : '1px solid rgba(251, 191, 36, 0.25)',
                    boxShadow: `
                        0 25px 70px -30px rgba(15, 23, 42, 0.35),
                        inset 0 1px 2px rgba(255, 255, 255, 0.4)
                    `,
                }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center"
                        style={{
                            background: isValidSession
                                ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.1))'
                                : 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1))',
                            border: isValidSession
                                ? '2px solid rgba(52, 211, 153, 0.3)'
                                : '2px solid rgba(251, 191, 36, 0.3)',
                        }}
                    >
                        {isValidSession ? (
                            <CheckCircle2 size={32} className="text-emerald-500" />
                        ) : (
                            <Clock size={32} className="text-amber-500" />
                        )}
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-slate-800 mb-2">
                    {isValidSession ? 'End Session?' : 'Session Too Short'}
                </h3>

                {/* Description */}
                <p className="text-center text-slate-500 text-sm mb-4">
                    {isValidSession
                        ? 'Great focus! This session will be saved to your records.'
                        : 'Sessions under 1 minute won\'t be recorded. Keep going!'}
                </p>

                {/* Time display */}
                <div
                    className="rounded-2xl p-4 mb-6"
                    style={{
                        background: 'rgba(241, 245, 249, 0.7)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                    }}
                >
                    <p className="text-center text-xs text-slate-400 uppercase tracking-wider mb-1">
                        Session Duration
                    </p>
                    <p className={`text-center text-3xl font-bold ${isValidSession ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {formatTime(elapsedTime)}
                    </p>
                    {!isValidSession && (
                        <p className="text-center text-xs text-slate-400 mt-2">
                            Need {formatTime(60 - elapsedTime)} more for valid session
                        </p>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'rgba(241, 245, 249, 0.9)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            color: '#64748b',
                        }}
                    >
                        {isValidSession ? 'Continue' : 'Keep Going'}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: isValidSession
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            boxShadow: isValidSession
                                ? '0 4px 16px -4px rgba(16, 185, 129, 0.4)'
                                : '0 4px 16px -4px rgba(245, 158, 11, 0.4)',
                        }}
                    >
                        {isValidSession ? 'End & Save' : 'Discard'}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FocusTimerProps {
    todayFocusTime?: number;
    // Timer state from parent
    orbState: OrbState;
    elapsedTime: number;
    // Timer controls from parent
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
    onComplete: () => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({
    todayFocusTime = 0,
    orbState,
    elapsedTime,
    onStart,
    onPause,
    onReset,
    onComplete,
}) => {
    const [showEndModal, setShowEndModal] = useState(false);

    const isRunning = orbState === 'running';
    const isActive = orbState === 'running' || orbState === 'forming';

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatMinutes = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const handleOrbClick = () => {
        if (orbState === 'idle') {
            if (elapsedTime > 0) {
                // Resume
                onStart();
            } else {
                // Start fresh
                onStart();
            }
        } else if (orbState === 'running') {
            // Pause
            onPause();
        }
        // If in transition, do nothing
    };



    // Determine CSS class for orb state
    const getOrbClass = () => {
        switch (orbState) {
            case 'forming': return 'timer-glass-forming';
            case 'running': return 'timer-glass-active';
            case 'dissolving': return 'timer-glass-dissolving';
            default: return 'timer-glass';
        }
    };

    return (
        <div className="animate-fade-in min-h-[70vh] flex flex-col">
            {/* Today's Summary */}
            <div className="glass-card glass-card-sky rounded-2xl p-5 mb-8 ring-1 ring-white/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(139, 92, 246, 0.1))',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                boxShadow: '0 4px 16px -4px rgba(56, 189, 248, 0.2)'
                            }}>
                            <Clock size={22} className="text-sky-500" />
                        </div>
                        <div>
                            <p className="text-sm text-sky-600/80 font-medium">Today's Flow</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-violet-600 bg-clip-text text-transparent">
                                {formatMinutes(todayFocusTime + elapsedTime)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Sessions</p>
                        <div className="flex items-center gap-1.5 justify-end">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                            <span className="text-lg font-bold text-slate-700">3</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timer Display - Realistic Water Droplet */}
            <div className="flex-1 flex flex-col items-center py-6" style={{ minHeight: '380px' }}>
                {/* Main Timer Container - Fixed position wrapper */}
                <div className="relative flex items-center justify-center" style={{ height: '280px', width: '280px' }}>
                    {/* Main Interactive Water Droplet Orb */}
                    <button
                        onClick={handleOrbClick}
                        disabled={orbState === 'forming' || orbState === 'dissolving'}
                        className={`
                            relative w-64 h-64 
                            flex flex-col items-center justify-center
                            cursor-pointer
                            focus:outline-none
                            ${orbState === 'forming' || orbState === 'dissolving' ? 'cursor-wait' : ''}
                            ${getOrbClass()}
                        `}
                        style={{
                            borderRadius: '50%',
                            animation: isRunning ? 'waterDropFloat 12s ease-in-out infinite' : undefined,
                        }}
                    >
                        {/* Primary Highlight - Top left surface reflection (specular) */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                top: '8%',
                                left: '12%',
                                width: '45%',
                                height: '32%',
                                background: 'radial-gradient(ellipse 70% 60% at 40% 40%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.25) 35%, transparent 65%)',
                                borderRadius: '50%',
                                filter: 'blur(1px)',
                                opacity: isActive ? 0.9 : 0.75
                            }}
                        />

                        {/* Secondary Highlight - Right side accent */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                top: '14%',
                                left: '55%',
                                width: '16%',
                                height: '12%',
                                background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 70%)',
                                borderRadius: '50%',
                                filter: 'blur(1px)',
                                opacity: isActive ? 0.75 : 0.55
                            }}
                        />

                        {/* Bottom Curve Shadow - Depth under the sphere */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                bottom: '8%',
                                left: '20%',
                                right: '20%',
                                height: '20%',
                                background: 'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(14, 165, 233, 0.08) 0%, transparent 70%)',
                                borderRadius: '50%',
                                filter: 'blur(3px)',
                                opacity: isActive ? 0.8 : 0.6
                            }}
                        />

                        {/* Time Display */}
                        <span
                            className="text-5xl font-bold tracking-tight font-mono relative z-10 transition-all duration-500"
                            style={{
                                color: '#1e293b',
                                textShadow: isActive
                                    ? '0 2px 8px rgba(255,255,255,0.6), 0 0 30px rgba(56, 189, 248, 0.2)'
                                    : '0 1px 4px rgba(255,255,255,0.4)'
                            }}
                        >
                            {formatTime(elapsedTime)}
                        </span>

                        {/* Status Label */}
                        <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full transition-all duration-500"
                            style={{
                                background: 'rgba(255, 255, 255, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(8px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                            {isRunning && (
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        background: 'linear-gradient(135deg, #34d399, #10b981)',
                                        animation: 'softPulse 2.5s ease-in-out infinite'
                                    }}
                                />
                            )}
                            <span className="text-sm font-medium text-slate-600">
                                {orbState === 'forming' ? 'Starting...' :
                                    orbState === 'running' ? 'In Flow' :
                                        orbState === 'dissolving' ? 'Pausing...' :
                                            elapsedTime > 0 ? 'Paused' : 'Tap to Start'}
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Bottom Controls Area */}
            <div className="flex flex-col items-center">
                {/* Controls - Only show when timer has time or is running */}
                {(isRunning || elapsedTime > 0) && (
                    <div className="flex items-center justify-center pb-2">
                        {/* End Session Button - Long Press */}
                        <LongPressButton
                            onComplete={() => setShowEndModal(true)}
                            disabled={orbState === 'forming' || orbState === 'dissolving'}
                            size={56}
                            duration={1200}
                            variant="danger"
                            title="End Session"
                            icon={
                                <X
                                    size={24}
                                    className="text-rose-400"
                                    strokeWidth={2.5}
                                />
                            }
                        />
                    </div>
                )}

                {/* Hint Text */}
                <p className="text-center text-sm text-slate-400 mt-4 font-medium">
                    {orbState === 'running'
                        ? "Tap the droplet to pause"
                        : orbState === 'forming'
                            ? "Forming..."
                            : orbState === 'dissolving'
                                ? "Settling..."
                                : elapsedTime > 0
                                    ? "Tap to continue, or end your session"
                                    : "Tap the orb to begin your focus session"
                    }
                </p>
            </div>

            {/* Session End Confirmation Modal */}
            <SessionEndModal
                isOpen={showEndModal}
                elapsedTime={elapsedTime}
                onConfirm={() => {
                    setShowEndModal(false);
                    onComplete();
                }}
                onCancel={() => setShowEndModal(false)}
            />
        </div>
    );
};

export default FocusTimer;
