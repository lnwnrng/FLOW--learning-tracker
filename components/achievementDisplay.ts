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
}> = {
    first_session: {
        icon: Zap,
        color: 'from-amber-400 to-yellow-500',
    },
    hour_master: {
        icon: Clock,
        color: 'from-indigo-400 to-purple-500',
    },
    streak_week: {
        icon: Flame,
        color: 'from-orange-400 to-red-500',
    },
    streak_month: {
        icon: Star,
        color: 'from-violet-400 to-purple-500',
    },
    total_hours_10: {
        icon: Clock,
        color: 'from-sky-400 to-blue-500',
    },
    total_hours_50: {
        icon: Trophy,
        color: 'from-emerald-400 to-green-500',
    },
    total_hours_100: {
        icon: Trophy,
        color: 'from-amber-500 to-orange-600',
    },
    early_bird: {
        icon: Sun,
        color: 'from-yellow-400 to-orange-500',
    },
    night_owl: {
        icon: Moon,
        color: 'from-indigo-500 to-purple-600',
    },
    task_master: {
        icon: Award,
        color: 'from-cyan-400 to-teal-500',
    },
};
