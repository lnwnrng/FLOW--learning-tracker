import React from 'react';
import { ArrowLeft, Trophy, Star, Flame, Target, Clock, Zap, Award } from 'lucide-react';

interface AchievementsPageProps {
    onBack: () => void;
    currentStreak?: number;
    longestStreak?: number;
    totalFocusTime?: number;
    totalSessions?: number;
    tasksCompleted?: number;
}

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    progress: number;
    target: number;
    unlocked: boolean;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({
    onBack,
    currentStreak = 7,
    longestStreak = 23,
    totalFocusTime = 1250,
    totalSessions = 48,
    tasksCompleted = 156,
}) => {
    const achievements: Achievement[] = [
        {
            id: 'first-focus',
            title: 'First Flow',
            description: 'Complete your first focus session',
            icon: Zap,
            color: 'from-amber-400 to-yellow-500',
            progress: 1,
            target: 1,
            unlocked: true,
        },
        {
            id: 'week-streak',
            title: 'Week Warrior',
            description: 'Maintain a 7-day streak',
            icon: Flame,
            color: 'from-orange-400 to-red-500',
            progress: currentStreak,
            target: 7,
            unlocked: currentStreak >= 7,
        },
        {
            id: 'month-streak',
            title: 'Monthly Master',
            description: 'Maintain a 30-day streak',
            icon: Star,
            color: 'from-violet-400 to-purple-500',
            progress: longestStreak,
            target: 30,
            unlocked: longestStreak >= 30,
        },
        {
            id: '10-hours',
            title: 'Time Keeper',
            description: 'Accumulate 10 hours of focus time',
            icon: Clock,
            color: 'from-sky-400 to-blue-500',
            progress: Math.floor(totalFocusTime / 60),
            target: 10,
            unlocked: totalFocusTime >= 600,
        },
        {
            id: '100-hours',
            title: 'Century Club',
            description: 'Accumulate 100 hours of focus time',
            icon: Trophy,
            color: 'from-emerald-400 to-green-500',
            progress: Math.floor(totalFocusTime / 60),
            target: 100,
            unlocked: totalFocusTime >= 6000,
        },
        {
            id: '50-sessions',
            title: 'Session Sage',
            description: 'Complete 50 focus sessions',
            icon: Target,
            color: 'from-pink-400 to-rose-500',
            progress: totalSessions,
            target: 50,
            unlocked: totalSessions >= 50,
        },
        {
            id: '100-tasks',
            title: 'Task Terminator',
            description: 'Complete 100 tasks',
            icon: Award,
            color: 'from-cyan-400 to-teal-500',
            progress: tasksCompleted,
            target: 100,
            unlocked: tasksCompleted >= 100,
        },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Achievements</h1>
                    <p className="text-sm text-slate-500">{unlockedCount} of {achievements.length} unlocked</p>
                </div>
            </div>

            {/* Progress Overview */}
            <div className="glass-card rounded-2xl p-5 ring-1 ring-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                        <Trophy size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-3xl font-bold text-slate-800">{unlockedCount}</p>
                        <p className="text-sm text-slate-500">Achievements Earned</p>
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500"
                                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="space-y-3">
                {achievements.map((achievement) => {
                    const Icon = achievement.icon;
                    const progressPercent = Math.min((achievement.progress / achievement.target) * 100, 100);

                    return (
                        <div
                            key={achievement.id}
                            className={`glass-card rounded-2xl p-4 ring-1 ring-white/10 ${!achievement.unlocked ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center ${!achievement.unlocked ? 'grayscale' : ''}`}>
                                    <Icon size={24} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-800">{achievement.title}</h3>
                                        {achievement.unlocked && (
                                            <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-600 font-semibold rounded-full">
                                                Unlocked
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-0.5">{achievement.description}</p>
                                    {!achievement.unlocked && (
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                                <span>Progress</span>
                                                <span>{achievement.progress} / {achievement.target}</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full bg-gradient-to-r ${achievement.color} rounded-full transition-all duration-500`}
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AchievementsPage;
