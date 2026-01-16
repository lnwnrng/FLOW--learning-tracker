import React, { useState, useEffect, useRef } from 'react';
import { Clock, Calendar, CheckCircle2, RotateCcw, X } from 'lucide-react';
import { Task } from '../types';

interface FocusTimerProps {
    tasks?: Task[];
    todayFocusTime?: number;
    onSessionComplete?: (duration: number, taskId?: string) => void;
}

type OrbState = 'idle' | 'forming' | 'running' | 'dissolving';

const FocusTimer: React.FC<FocusTimerProps> = ({
    tasks = [],
    todayFocusTime = 0,
    onSessionComplete,
}) => {
    const [orbState, setOrbState] = useState<OrbState>('idle');
    const [elapsedTime, setElapsedTime] = useState(0);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    const isRunning = orbState === 'running';
    const isActive = orbState === 'running' || orbState === 'forming';

    // Timer logic
    useEffect(() => {
        if (isRunning) {
            startTimeRef.current = Date.now() - elapsedTime * 1000;
            intervalRef.current = window.setInterval(() => {
                if (startTimeRef.current) {
                    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
                }
            }, 100);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

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
            // Start: transition from idle -> forming -> running
            setOrbState('forming');
            setTimeout(() => {
                setOrbState('running');
            }, 500); // Match the dropletForm animation duration
        } else if (orbState === 'running') {
            // Pause: transition from running -> dissolving -> idle (paused)
            setOrbState('dissolving');
            setTimeout(() => {
                setOrbState('idle');
            }, 400); // Match the dropletDissolve animation duration
        } else if (orbState === 'dissolving' || orbState === 'forming') {
            // If in transition, do nothing
            return;
        }
    };

    const handleReset = () => {
        if (orbState === 'running') {
            setOrbState('dissolving');
            setTimeout(() => {
                setOrbState('idle');
                setElapsedTime(0);
                setSelectedTaskId(null);
            }, 400);
        } else {
            setOrbState('idle');
            setElapsedTime(0);
            setSelectedTaskId(null);
        }
    };

    const handleComplete = () => {
        if (orbState === 'running') {
            setOrbState('dissolving');
            setTimeout(() => {
                setOrbState('idle');
                if (elapsedTime > 0) {
                    onSessionComplete?.(elapsedTime, selectedTaskId || undefined);
                }
                setElapsedTime(0);
                setSelectedTaskId(null);
            }, 400);
        } else {
            if (elapsedTime > 0) {
                onSessionComplete?.(elapsedTime, selectedTaskId || undefined);
            }
            setElapsedTime(0);
            setSelectedTaskId(null);
        }
    };

    const handleResume = () => {
        if (orbState === 'idle' && elapsedTime > 0) {
            setOrbState('forming');
            setTimeout(() => {
                setOrbState('running');
            }, 500);
        }
    };

    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    const incompleteTasks = tasks.filter(t => !t.completed);

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
                        onClick={orbState === 'idle' && elapsedTime > 0 ? handleResume : handleOrbClick}
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

                {/* Selected Task Badge */}
                {selectedTask && (
                    <div className="mt-8 px-5 py-2.5 glass-card-light rounded-2xl ring-1 ring-white/20 flex items-center gap-3 max-w-xs">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 truncate">
                            {selectedTask.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Bottom Controls Area - Fixed height to prevent layout shift */}
            <div style={{ minHeight: '140px' }} className="flex flex-col items-center">
                {/* Task Selection */}
                {orbState === 'idle' && incompleteTasks.length > 0 && elapsedTime === 0 && (
                    <div className="mb-4 w-full">
                        <p className="text-sm font-medium text-slate-500 mb-3 flex items-center gap-2">
                            <Calendar size={14} />
                            Link to a task (optional)
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
                            {incompleteTasks.slice(0, 5).map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => setSelectedTaskId(
                                        selectedTaskId === task.id ? null : task.id
                                    )}
                                    className={`
                                        flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium
                                        transition-all duration-300
                                        ${selectedTaskId === task.id
                                            ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/20'
                                            : 'glass-card-light text-slate-600 hover:ring-2 hover:ring-sky-300/40'
                                        }
                                    `}
                                >
                                    {task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controls - Only show when timer has time or is running */}
                {(isRunning || elapsedTime > 0) && (
                    <div className="flex items-center justify-center gap-4">
                        {/* Reset Button */}
                        <button
                            onClick={handleReset}
                            disabled={orbState === 'forming' || orbState === 'dissolving'}
                            className="group relative w-12 h-12 rounded-full flex items-center justify-center
                                transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, rgba(241, 245, 249, 0.9), rgba(226, 232, 240, 0.7))',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.1), inset 0 1px 2px rgba(255,255,255,0.6)'
                            }}
                            title="Reset"
                        >
                            <RotateCcw
                                size={20}
                                className="text-slate-500 group-hover:text-slate-700 transition-all duration-500 group-hover:-rotate-180"
                            />
                        </button>

                        {/* Complete/End Session Button */}
                        <button
                            onClick={handleComplete}
                            disabled={orbState === 'forming' || orbState === 'dissolving'}
                            className="group relative w-14 h-14 rounded-full flex items-center justify-center
                                transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, rgba(254, 226, 226, 0.8), rgba(254, 202, 202, 0.6))',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(252, 165, 165, 0.4)',
                                boxShadow: '0 4px 24px -4px rgba(239, 68, 68, 0.2), inset 0 1px 2px rgba(255,255,255,0.4)'
                            }}
                            title="End Session"
                        >
                            <X
                                size={24}
                                className="text-rose-400 group-hover:text-rose-500 transition-colors duration-300"
                                strokeWidth={2.5}
                            />
                        </button>
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
        </div>
    );
};

export default FocusTimer;
