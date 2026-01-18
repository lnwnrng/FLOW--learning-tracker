import type { ElementType } from 'react';
import {
    Trophy,
    Star,
    Flame,
    Clock,
    Zap,
    Award,
    Moon,
    Sun,
} from 'lucide-react';
import type { AchievementType } from '../types';

export const achievementDisplay: Record<AchievementType, {
    icon: ElementType;
    color: string;
    title: string;
    description: string;
}> = {
    first_session: {
        icon: Zap,
        color: 'from-amber-400 to-yellow-500',
        title: 'First Flow',
        description: 'Complete your first focus session',
    },
    hour_master: {
        icon: Clock,
        color: 'from-indigo-400 to-purple-500',
        title: 'Hour Master',
        description: 'Complete a single session over 1 hour',
    },
    streak_week: {
        icon: Flame,
        color: 'from-orange-400 to-red-500',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
    },
    streak_month: {
        icon: Star,
        color: 'from-violet-400 to-purple-500',
        title: 'Monthly Champion',
        description: 'Maintain a 30-day streak',
    },
    total_hours_10: {
        icon: Clock,
        color: 'from-sky-400 to-blue-500',
        title: '10 Hours Club',
        description: 'Accumulate 10 hours of focus time',
    },
    total_hours_50: {
        icon: Trophy,
        color: 'from-emerald-400 to-green-500',
        title: '50 Hours Legend',
        description: 'Accumulate 50 hours of focus time',
    },
    total_hours_100: {
        icon: Trophy,
        color: 'from-amber-500 to-orange-600',
        title: 'Century Master',
        description: 'Accumulate 100 hours of focus time',
    },
    early_bird: {
        icon: Sun,
        color: 'from-yellow-400 to-orange-500',
        title: 'Early Bird',
        description: 'Start a session before 6 AM',
    },
    night_owl: {
        icon: Moon,
        color: 'from-indigo-500 to-purple-600',
        title: 'Night Owl',
        description: 'Complete a session after 11 PM',
    },
    task_master: {
        icon: Award,
        color: 'from-cyan-400 to-teal-500',
        title: 'Task Master',
        description: 'Complete 50 tasks',
    },
};
