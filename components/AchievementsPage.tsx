import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useUserStore } from '../stores';
import { getAchievements, markAchievementsSeen } from '../services/achievementService';
import type { AchievementInfo } from '../types';
import { achievementDisplay } from './achievementDisplay';

interface AchievementsPageProps {
    onBack: () => void;
    onViewed?: () => void;
    currentStreak?: number;
    longestStreak?: number;
    totalFocusTime?: number;
    totalSessions?: number;
    tasksCompleted?: number;
}

const AchievementsPage: React.FC<AchievementsPageProps> = ({
    onBack,
    onViewed,
    currentStreak = 0,
    longestStreak = 0,
    totalFocusTime = 0,
    totalSessions = 0,
    tasksCompleted = 0,
}) => {
    const { user } = useUserStore();
    const [achievements, setAchievements] = useState<AchievementInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch achievements from backend
    useEffect(() => {
        if (!user) return;

        setIsLoading(true);
        getAchievements(user.id)
            .then(data => {
                setAchievements(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch achievements:', err);
                setIsLoading(false);
            });

        markAchievementsSeen(user.id)
            .then(() => onViewed?.())
            .catch(err => console.error('Failed to mark achievements as seen:', err));
    }, [user, onViewed]);

    // Build display data
    const displayAchievements = achievements.map(a => {
        const config = achievementDisplay[a.achievementType] || {
            icon: Trophy,
            color: 'from-slate-400 to-slate-500',
            title: a.name,
            description: a.description,
        };

        // Calculate progress for locked achievements
        let progress = 0;
        let target = 1;

        switch (a.achievementType) {
            case 'first_session':
                progress = totalSessions > 0 ? 1 : 0;
                target = 1;
                break;
            case 'streak_week':
                progress = currentStreak;
                target = 7;
                break;
            case 'streak_month':
                progress = longestStreak;
                target = 30;
                break;
            case 'total_hours_10':
                progress = Math.floor(totalFocusTime / 60);
                target = 10;
                break;
            case 'total_hours_50':
                progress = Math.floor(totalFocusTime / 60);
                target = 50;
                break;
            case 'total_hours_100':
                progress = Math.floor(totalFocusTime / 60);
                target = 100;
                break;
            case 'task_master':
                progress = tasksCompleted;
                target = 50;
                break;
            case 'hour_master':
                progress = 0; // Would need max session duration
                target = 60;
                break;
            default:
                progress = a.unlocked ? 1 : 0;
                target = 1;
        }

        return {
            id: a.achievementType,
            title: config.title,
            description: a.description,
            icon: config.icon,
            color: config.color,
            progress: a.unlocked ? target : progress,
            target,
            unlocked: a.unlocked,
            unlockedAt: a.unlockedAt,
        };
    });

    const unlockedCount = displayAchievements.filter(a => a.unlocked).length;

    if (isLoading) {
        return (
            <div className="animate-fade-in flex items-center justify-center h-64">
                <div className="animate-pulse text-slate-600">Loading achievements...</div>
            </div>
        );
    }

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
                    <p className="text-sm text-slate-500">{unlockedCount} of {displayAchievements.length} unlocked</p>
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
                                style={{ width: `${displayAchievements.length > 0 ? (unlockedCount / displayAchievements.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="space-y-3">
                {displayAchievements.map((achievement) => {
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
