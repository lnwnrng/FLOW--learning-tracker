import React, { useMemo } from 'react';
import { Flame, TrendingUp, Clock } from 'lucide-react';

interface HomePageProps {
    userName?: string;
    userAvatar?: string | null;
    todayMinutes?: number;
    weekData?: number[]; // 7 days [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    currentStreak?: number;
    longestStreak?: number;
    averageMinutes?: number;
}

// Inspirational quotes
const quotes = [
    "Flow like water, grow like tree.",
    "Small steps every day lead to big results.",
    "The secret of getting ahead is getting started.",
    "Your future self will thank you.",
    "Progress, not perfection.",
    "Every expert was once a beginner.",
    "Discipline is the bridge between goals and achievement.",
];

const HomePage: React.FC<HomePageProps> = ({
    userName = 'Alex',
    userAvatar = null,
    todayMinutes = 165, // 2h 45m mock
    weekData = [45, 120, 90, 0, 80, 165, 0], // Mock week data
    currentStreak = 7,
    longestStreak = 23,
    averageMinutes = 45,
}) => {
    // Get greeting based on time
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    // Format date
    const dateString = useMemo(() => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    }, []);

    // Format time (minutes to hours and minutes)
    const formatTime = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { hours: hrs, minutes: mins };
    };

    const todayTime = formatTime(todayMinutes);

    // Daily quote (changes based on day)
    const dailyQuote = useMemo(() => {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        return quotes[dayOfYear % quotes.length];
    }, []);

    // Week heatmap colors
    const getHeatmapColor = (minutes: number) => {
        if (minutes === 0) return 'bg-slate-200';
        if (minutes < 30) return 'bg-emerald-200';
        if (minutes < 60) return 'bg-emerald-300';
        if (minutes < 120) return 'bg-emerald-400';
        return 'bg-emerald-500';
    };

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Greeting Section with Avatar */}
            <div className="pt-2 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {greeting}, {userName}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">{dateString}</p>
                </div>

                {/* Rainbow Ring Avatar (static) */}
                <div className="relative">
                    <div className="w-14 h-14 rounded-full p-[3px] rainbow-ring">
                        <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <span className="text-lg font-bold text-slate-400">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Card - Today's Flow */}
            <div
                className="relative overflow-hidden rounded-3xl p-6 glass-card ring-1 ring-white/10"
            >
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-violet-400/20 to-transparent blur-2xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-tr from-sky-400/20 to-transparent blur-2xl" />

                {/* Content */}
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M4 12C4 12 6 9 9 9C12 9 12 12 15 12C18 12 20 9 20 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                <path d="M4 16C4 16 6 13 9 13C12 13 12 16 15 16C18 16 20 13 20 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-600">Today's Flow</span>
                    </div>

                    {/* Time Display */}
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-6xl font-bold text-slate-800 tracking-tight">
                            {todayTime.hours}
                        </span>
                        <span className="text-2xl font-semibold text-slate-500 mr-2">h</span>
                        <span className="text-6xl font-bold text-slate-800 tracking-tight">
                            {todayTime.minutes.toString().padStart(2, '0')}
                        </span>
                        <span className="text-2xl font-semibold text-slate-500">m</span>
                    </div>

                    {/* Mini Week Heatmap */}
                    <div className="glass-card-light rounded-2xl p-4 ring-1 ring-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">This Week</span>
                            <span className="text-xs text-slate-400">
                                {weekData.reduce((a, b) => a + b, 0)} min total
                            </span>
                        </div>
                        <div className="flex justify-between gap-2">
                            {weekData.map((minutes, index) => (
                                <div key={index} className="flex flex-col items-center gap-1.5">
                                    <div
                                        className={`w-8 h-8 rounded-lg ${getHeatmapColor(minutes)} transition-all duration-300 hover:scale-110`}
                                        title={`${weekDays[index]}: ${minutes}m`}
                                    />
                                    <span className="text-xs font-medium text-slate-400">{weekDays[index]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-3 gap-3">
                {/* Streak */}
                <div className="glass-card glass-card-amber rounded-2xl p-4 ring-1 ring-white/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-2">
                        <Flame size={18} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{currentStreak}</p>
                    <p className="text-xs text-slate-500 font-medium">Day Streak</p>
                </div>

                {/* Best Streak */}
                <div className="glass-card glass-card-violet rounded-2xl p-4 ring-1 ring-white/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mb-2">
                        <TrendingUp size={18} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{longestStreak}</p>
                    <p className="text-xs text-slate-500 font-medium">Best</p>
                </div>

                {/* Average */}
                <div className="glass-card glass-card-sky rounded-2xl p-4 ring-1 ring-white/10">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center mb-2">
                        <Clock size={18} className="text-white" />
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{averageMinutes}m</p>
                    <p className="text-xs text-slate-500 font-medium">Avg/Day</p>
                </div>
            </div>

            {/* Daily Quote */}
            <div className="text-center py-4">
                <p className="text-slate-400 italic font-medium text-sm">
                    "{dailyQuote}"
                </p>
            </div>
        </div>
    );
};

export default HomePage;
