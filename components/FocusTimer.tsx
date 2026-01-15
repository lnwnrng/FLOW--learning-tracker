import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface FocusTimerProps {
    tasks?: Task[];
    todayFocusTime?: number; // in seconds
    onSessionComplete?: (duration: number, taskId?: string) => void;
}

const FocusTimer: React.FC<FocusTimerProps> = ({
    tasks = [],
    todayFocusTime = 0,
    onSessionComplete,
}) => {
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0); // in seconds
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

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

    const handleStart = () => {
        setIsRunning(true);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleStop = () => {
        setIsRunning(false);
        if (elapsedTime > 0) {
            onSessionComplete?.(elapsedTime, selectedTaskId || undefined);
        }
        setElapsedTime(0);
        setSelectedTaskId(null);
    };

    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    const incompleteTasks = tasks.filter(t => !t.completed);

    return (
        <div className="animate-fade-in min-h-[70vh] flex flex-col">
            {/* Today's Summary */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-4 border border-sky-100 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Clock size={20} className="text-sky-500" />
                        </div>
                        <div>
                            <p className="text-sm text-sky-600 font-medium">Today's Focus</p>
                            <p className="text-xl font-bold text-slate-800">
                                {formatMinutes(todayFocusTime + elapsedTime)}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Sessions</p>
                        <p className="text-lg font-bold text-slate-700">3</p>
                    </div>
                </div>
            </div>

            {/* Timer Display */}
            <div className="flex-1 flex flex-col items-center justify-center py-8">
                {/* Timer Circle */}
                <div className="relative">
                    {/* Outer ring - animated when running */}
                    <div
                        className={`
              absolute inset-0 rounded-full
              ${isRunning ? 'animate-pulse' : ''}
            `}
                        style={{
                            background: isRunning
                                ? 'conic-gradient(from 0deg, #0ea5e9, #38bdf8, #7dd3fc, #0ea5e9)'
                                : 'transparent',
                            padding: '3px',
                        }}
                    >
                        <div className="w-full h-full rounded-full bg-[#F8FAFC]" />
                    </div>

                    {/* Main timer container */}
                    <div
                        className={`
              relative w-56 h-56 rounded-full 
              flex flex-col items-center justify-center
              transition-all duration-500
              ${isRunning
                                ? 'bg-gradient-to-br from-sky-400 to-blue-500 shadow-2xl shadow-sky-500/30'
                                : 'bg-white border-2 border-slate-200 shadow-lg shadow-slate-200/50'
                            }
            `}
                    >
                        {/* Time display */}
                        <span
                            className={`
                text-4xl font-bold tracking-tight font-mono
                ${isRunning ? 'text-white' : 'text-slate-700'}
              `}
                        >
                            {formatTime(elapsedTime)}
                        </span>

                        {/* Status text */}
                        <span
                            className={`
                text-sm font-medium mt-2
                ${isRunning ? 'text-white/70' : 'text-slate-400'}
              `}
                        >
                            {isRunning ? 'Focusing...' : elapsedTime > 0 ? 'Paused' : 'Ready'}
                        </span>
                    </div>
                </div>

                {/* Selected Task */}
                {selectedTask && (
                    <div className="mt-6 px-4 py-2 bg-white rounded-xl border border-slate-200 flex items-center gap-2 max-w-xs">
                        <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700 truncate">
                            {selectedTask.title}
                        </span>
                    </div>
                )}
            </div>

            {/* Task Selection */}
            {!isRunning && incompleteTasks.length > 0 && (
                <div className="mb-6">
                    <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1.5">
                        <Calendar size={14} />
                        Link to a task (optional)
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {incompleteTasks.slice(0, 5).map(task => (
                            <button
                                key={task.id}
                                onClick={() => setSelectedTaskId(
                                    selectedTaskId === task.id ? null : task.id
                                )}
                                className={`
                  flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${selectedTaskId === task.id
                                        ? 'bg-sky-500 text-white'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
                                    }
                `}
                            >
                                {task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
                {!isRunning ? (
                    <>
                        {elapsedTime > 0 && (
                            <button
                                onClick={handleStop}
                                className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                            >
                                <Square size={24} fill="currentColor" />
                            </button>
                        )}
                        <button
                            onClick={handleStart}
                            className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white flex items-center justify-center shadow-xl shadow-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Play size={36} fill="white" className="translate-x-0.5" />
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={handleStop}
                            className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors"
                        >
                            <Square size={24} fill="currentColor" />
                        </button>
                        <button
                            onClick={handlePause}
                            className="w-20 h-20 rounded-full bg-white border-2 border-slate-200 text-slate-700 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                        >
                            <Pause size={36} fill="currentColor" />
                        </button>
                    </>
                )}
            </div>

            {/* Tip */}
            <p className="text-center text-xs text-slate-400 mt-8">
                {isRunning
                    ? "Stay focused. You're doing great!"
                    : "Tap the button to start your focus session"
                }
            </p>
        </div>
    );
};

export default FocusTimer;
