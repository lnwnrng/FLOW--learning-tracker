import React, { useMemo } from 'react';

interface HomePageProps {
    userName?: string;
    userAvatar?: string | null;
    todayMinutes?: number;
    weekData?: number[]; // 7 days [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
}

const HomePage: React.FC<HomePageProps> = ({
    userName = 'Alex',
    userAvatar = null,
    todayMinutes = 165,
    weekData = [45, 120, 90, 30, 80, 165, 60],
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

    // Format time
    const formatTime = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { hours: hrs, minutes: mins };
    };

    const todayTime = formatTime(todayMinutes);
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const todayIndex = new Date().getDay();

    // Calculate max for normalization
    const maxValue = Math.max(...weekData, 1);

    // Generate smooth flowing SVG path
    const generateFlowPath = () => {
        const width = 320;
        const height = 100;
        const padding = 20;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding;

        // Normalize data points
        const points = weekData.map((value, index) => ({
            x: padding + (index / 6) * graphWidth,
            y: height - padding - (value / maxValue) * graphHeight * 0.85,
        }));

        // Create smooth bezier curve through points
        let path = `M ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlX1 = current.x + (next.x - current.x) / 3;
            const controlX2 = next.x - (next.x - current.x) / 3;
            path += ` C ${controlX1} ${current.y}, ${controlX2} ${next.y}, ${next.x} ${next.y}`;
        }

        return path;
    };

    // Generate area path (for gradient fill under the curve)
    const generateAreaPath = () => {
        const width = 320;
        const height = 100;
        const padding = 20;
        const graphWidth = width - padding * 2;
        const graphHeight = height - padding;

        const points = weekData.map((value, index) => ({
            x: padding + (index / 6) * graphWidth,
            y: height - padding - (value / maxValue) * graphHeight * 0.85,
        }));

        let path = `M ${points[0].x} ${height - padding}`;
        path += ` L ${points[0].x} ${points[0].y}`;

        for (let i = 0; i < points.length - 1; i++) {
            const current = points[i];
            const next = points[i + 1];
            const controlX1 = current.x + (next.x - current.x) / 3;
            const controlX2 = next.x - (next.x - current.x) / 3;
            path += ` C ${controlX1} ${current.y}, ${controlX2} ${next.y}, ${next.x} ${next.y}`;
        }

        path += ` L ${points[points.length - 1].x} ${height - padding}`;
        path += ' Z';

        return path;
    };

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

                {/* Rainbow Ring Avatar */}
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

            {/* Hero Card - Today's Flow with Flow Curve */}
            <div className="glass-card ring-1 ring-white/10 rounded-3xl p-6 relative overflow-hidden">
                {/* Decorative gradient blobs */}
                <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br from-violet-400/25 to-purple-500/20 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-tr from-sky-400/20 to-cyan-400/15 blur-3xl" />
                <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-gradient-to-br from-pink-400/15 to-rose-400/10 blur-2xl" />

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 12C4 12 6 9 9 9C12 9 12 12 15 12C18 12 20 9 20 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                    <path d="M4 16C4 16 6 13 9 13C12 13 12 16 15 16C18 16 20 13 20 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-slate-600">Today's Flow</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-400">Weekly Total</span>
                            <p className="text-sm font-bold text-slate-600">
                                {Math.floor(weekData.reduce((a, b) => a + b, 0) / 60)}h {weekData.reduce((a, b) => a + b, 0) % 60}m
                            </p>
                        </div>
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

                    {/* Flow Curve Visualization */}
                    <div className="glass-card-light rounded-2xl p-4 ring-1 ring-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">This Week's Flow</span>
                        </div>

                        {/* SVG Flow Chart */}
                        <div className="relative">
                            <svg
                                viewBox="0 0 320 100"
                                className="w-full h-24"
                                preserveAspectRatio="none"
                            >
                                {/* Gradient definitions */}
                                <defs>
                                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#c084fc" />
                                        <stop offset="50%" stopColor="#60a5fa" />
                                        <stop offset="100%" stopColor="#34d399" />
                                    </linearGradient>
                                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3" />
                                        <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
                                    </linearGradient>
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                        <feMerge>
                                            <feMergeNode in="coloredBlur" />
                                            <feMergeNode in="SourceGraphic" />
                                        </feMerge>
                                    </filter>
                                </defs>

                                {/* Area fill under curve */}
                                <path
                                    d={generateAreaPath()}
                                    fill="url(#areaGradient)"
                                />

                                {/* Main flow curve */}
                                <path
                                    d={generateFlowPath()}
                                    fill="none"
                                    stroke="url(#flowGradient)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                    className="drop-shadow-lg"
                                />

                                {/* Data points */}
                                {weekData.map((value, index) => {
                                    const width = 320;
                                    const height = 100;
                                    const padding = 20;
                                    const graphWidth = width - padding * 2;
                                    const graphHeight = height - padding;
                                    const x = padding + (index / 6) * graphWidth;
                                    const y = height - padding - (value / maxValue) * graphHeight * 0.85;
                                    const isToday = index === todayIndex;

                                    return (
                                        <g key={index}>
                                            {/* Outer glow for today */}
                                            {isToday && (
                                                <circle
                                                    cx={x}
                                                    cy={y}
                                                    r="8"
                                                    fill="rgba(139, 92, 246, 0.3)"
                                                    className="animate-pulse"
                                                />
                                            )}
                                            {/* Point */}
                                            <circle
                                                cx={x}
                                                cy={y}
                                                r={isToday ? 5 : 4}
                                                fill={isToday ? '#8b5cf6' : '#ffffff'}
                                                stroke={isToday ? '#ffffff' : 'url(#flowGradient)'}
                                                strokeWidth="2"
                                            />
                                        </g>
                                    );
                                })}
                            </svg>

                            {/* Day labels */}
                            <div className="flex justify-between mt-2 px-4">
                                {weekDays.map((day, index) => (
                                    <span
                                        key={index}
                                        className={`text-xs font-medium ${index === todayIndex
                                                ? 'text-violet-600 font-bold'
                                                : 'text-slate-400'
                                            }`}
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
