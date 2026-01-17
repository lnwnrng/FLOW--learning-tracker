import React, { useMemo, useEffect } from 'react';
import {
    Flame,
    TrendingUp,
    Clock,
    Calendar,
    Target,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useSessionStore, useUserStore } from '../stores';

interface HeatmapDataItem {
    date: string; // YYYY-MM-DD
    value: number; // minutes of focus time
}

const StatsPage: React.FC = () => {
    const { user } = useUserStore();
    const {
        heatmapData: storeHeatmapData,
        userStats,
        fetchHeatmapData,
        fetchUserStats
    } = useSessionStore();

    const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

    // Fetch data on mount
    useEffect(() => {
        if (user) {
            fetchHeatmapData();
            fetchUserStats();
        }
    }, [user, fetchHeatmapData, fetchUserStats]);

    // Convert store data to component format
    const heatmapData: HeatmapDataItem[] = useMemo(() => {
        return storeHeatmapData.map(d => ({
            date: d.date,
            value: d.value, // Already in minutes from backend
        }));
    }, [storeHeatmapData]);

    // Stats from store with defaults
    const totalFocusTime = userStats ? Math.round(userStats.totalFocusTime / 60) : 0; // Convert seconds to minutes
    const currentStreak = userStats?.currentStreak ?? 0;
    const longestStreak = userStats?.longestStreak ?? 0;
    const totalSessions = userStats?.totalSessions ?? 0;
    const averageSessionTime = totalSessions > 0
        ? Math.round(totalFocusTime / totalSessions)
        : 0;

    // Process heatmap data
    const { weeks, months, maxValue } = useMemo(() => {
        const startDate = new Date(selectedYear, 0, 1);
        const endDate = new Date(selectedYear, 11, 31);

        // Adjust start to Sunday
        const startDay = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDay);

        const weeks: { date: Date; value: number }[][] = [];
        let currentWeek: { date: Date; value: number }[] = [];
        let maxVal = 0;

        const dataMap = new Map(heatmapData.map(d => [d.date, d.value]));

        const currentDate = new Date(startDate);
        while (currentDate <= endDate || currentWeek.length > 0) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const value = dataMap.get(dateStr) || 0;
            maxVal = Math.max(maxVal, value);

            currentWeek.push({ date: new Date(currentDate), value });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDate.setDate(currentDate.getDate() + 1);

            if (currentDate > endDate && currentWeek.length === 0) break;
        }

        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        // Generate month labels
        const monthLabels: { name: string; week: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, weekIndex) => {
            const firstDayOfWeek = week[0]?.date;
            if (firstDayOfWeek) {
                const month = firstDayOfWeek.getMonth();
                if (month !== lastMonth && firstDayOfWeek.getFullYear() === selectedYear) {
                    monthLabels.push({
                        name: firstDayOfWeek.toLocaleString('en-US', { month: 'short' }),
                        week: weekIndex,
                    });
                    lastMonth = month;
                }
            }
        });

        return { weeks, months: monthLabels, maxValue: maxVal };
    }, [heatmapData, selectedYear]);

    const getColor = (value: number) => {
        if (value === 0) return 'bg-slate-100';
        const intensity = value / maxValue;
        if (intensity < 0.25) return 'bg-emerald-200';
        if (intensity < 0.5) return 'bg-emerald-300';
        if (intensity < 0.75) return 'bg-emerald-400';
        return 'bg-emerald-500';
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Calculate this week and this month stats
    const thisWeekTime = useMemo(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        return heatmapData
            .filter(d => {
                const date = new Date(d.date);
                return date >= startOfWeek && date <= today;
            })
            .reduce((sum, d) => sum + d.value, 0);
    }, [heatmapData]);

    const thisMonthTime = useMemo(() => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return heatmapData
            .filter(d => {
                const date = new Date(d.date);
                return date >= startOfMonth && date <= today;
            })
            .reduce((sum, d) => sum + d.value, 0);
    }, [heatmapData]);

    const summaryCards = [
        {
            icon: Clock,
            label: 'Total Focus',
            value: formatTime(totalFocusTime),
            subtext: `${totalSessions} sessions`,
            color: 'from-violet-500 to-purple-600',
            bgColor: 'bg-violet-50',
        },
        {
            icon: Flame,
            label: 'Current Streak',
            value: `${currentStreak} days`,
            subtext: `Best: ${longestStreak} days`,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-50',
        },
        {
            icon: TrendingUp,
            label: 'This Week',
            value: formatTime(thisWeekTime),
            subtext: 'Focus time',
            color: 'from-emerald-500 to-green-500',
            bgColor: 'bg-emerald-50',
        },
        {
            icon: Calendar,
            label: 'This Month',
            value: formatTime(thisMonthTime),
            subtext: 'Focus time',
            color: 'from-sky-500 to-blue-500',
            bgColor: 'bg-sky-50',
        },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Statistics</h1>
                <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-slate-100">
                    <button
                        onClick={() => setSelectedYear(y => y - 1)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="px-3 font-semibold text-slate-700">{selectedYear}</span>
                    <button
                        onClick={() => setSelectedYear(y => Math.min(y + 1, new Date().getFullYear()))}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
                        disabled={selectedYear >= new Date().getFullYear()}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                {summaryCards.map((card, index) => {
                    const Icon = card.icon;
                    // Map bgColor to glass-card color variant
                    const glassColorClass = card.bgColor === 'bg-violet-50' ? 'glass-card-violet'
                        : card.bgColor === 'bg-orange-50' ? 'glass-card-amber'
                            : card.bgColor === 'bg-emerald-50' ? 'glass-card-emerald'
                                : 'glass-card-sky';
                    return (
                        <div
                            key={index}
                            className={`glass-card ${glassColorClass} rounded-2xl p-4 ring-1 ring-white/10`}
                        >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-2`}>
                                <Icon size={18} className="text-white" />
                            </div>
                            <p className="text-xl font-bold text-slate-800">{card.value}</p>
                            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{card.subtext}</p>
                        </div>
                    );
                })}
            </div>

            {/* Heatmap Card */}
            <div className="glass-card rounded-2xl p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Activity Heatmap</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>Less</span>
                        <div className="flex gap-0.5">
                            <div className="w-3 h-3 rounded-sm bg-slate-100" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-300" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                        </div>
                        <span>More</span>
                    </div>
                </div>

                {/* Scrollable Heatmap Container */}
                <div className="overflow-x-auto pb-2">
                    <div className="inline-flex flex-col min-w-max">
                        {/* Month labels row */}
                        <div className="flex mb-2 ml-8">
                            {weeks.map((week, weekIndex) => {
                                const firstDayOfWeek = week[0]?.date;
                                const month = months.find(m => m.week === weekIndex);
                                return (
                                    <div key={weekIndex} className="w-[13px] flex-shrink-0">
                                        {month && (
                                            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                                                {month.name}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Heatmap Grid */}
                        <div className="flex gap-0.5">
                            {/* Day labels */}
                            <div className="flex flex-col gap-0.5 mr-1 flex-shrink-0">
                                {weekDays.map((day, i) => (
                                    <div
                                        key={day}
                                        className="h-3 text-xs text-slate-400 font-medium flex items-center"
                                        style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Weeks */}
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-0.5">
                                    {week.map((day, dayIndex) => {
                                        const isCurrentYear = day.date.getFullYear() === selectedYear;
                                        const isFuture = day.date > new Date();

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={`
                                                    w-3 h-3 rounded-sm transition-colors
                                                    ${!isCurrentYear || isFuture ? 'bg-transparent' : getColor(day.value)}
                                                    ${day.value > 0 ? 'cursor-pointer hover:ring-2 hover:ring-slate-300' : ''}
                                                `}
                                                title={isCurrentYear && !isFuture ? `${day.date.toLocaleDateString()}: ${formatTime(day.value)}` : ''}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="glass-card rounded-2xl p-5 ring-1 ring-white/10">
                <h3 className="font-bold text-slate-800 mb-4">Weekly Overview</h3>
                <div className="space-y-3">
                    {weekDays.map((day, index) => {
                        // Calculate average for this day of week
                        const dayData = heatmapData.filter(d => new Date(d.date).getDay() === index);
                        const avgMinutes = dayData.length > 0
                            ? Math.round(dayData.reduce((sum, d) => sum + d.value, 0) / dayData.length)
                            : 0;
                        const maxDaily = 180; // 3 hours max for visualization
                        const percentage = Math.min((avgMinutes / maxDaily) * 100, 100);

                        return (
                            <div key={day} className="flex items-center gap-3">
                                <span className="w-10 text-sm font-medium text-slate-500">{day}</span>
                                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="w-12 text-right text-sm font-semibold text-slate-700">
                                    {formatTime(avgMinutes)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Best Day Highlight */}
            <div className="glass-card glass-card-amber rounded-2xl p-5 ring-1 ring-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Target size={24} className="text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-amber-700">Average Session</p>
                        <p className="text-2xl font-bold text-slate-800">{formatTime(averageSessionTime)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsPage;
