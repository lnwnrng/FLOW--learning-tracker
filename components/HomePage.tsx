import React, { useMemo, useState, useCallback } from 'react';
import { useSettingsStore } from '../stores';
import { useTranslation } from 'react-i18next';
import { languageToLocale, normalizeLanguage } from '../i18n';
import { triggerFeedback } from '../services/feedbackService';

interface HomePageProps {
    userName?: string;
    userAvatar?: string | null;
    todayMinutes?: number;
    weekData?: number[]; // 7 days [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
    currentStreak?: number;
}

const HomePage: React.FC<HomePageProps> = ({
    userName = 'Alex',
    userAvatar = null,
    todayMinutes = 165,
    weekData = [45, 120, 90, 30, 80, 165, 60],
    currentStreak = 7,
}) => {
    const { t, i18n } = useTranslation();
    const { settings } = useSettingsStore();
    const isDarkMode = settings['themeMode'] === 'dark';
    const locale = languageToLocale(normalizeLanguage(i18n.language));

    // Get greeting based on time
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greeting.morning');
        if (hour < 18) return t('home.greeting.afternoon');
        return t('home.greeting.evening');
    }, [t]);

    // Format date
    const dateString = useMemo(() => {
        return new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        }).format(new Date());
    }, [locale]);

    // Format time
    const formatTime = (minutes: number) => {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return { hours: hrs, minutes: mins };
    };

    const todayTime = formatTime(todayMinutes);
    const weekDays = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow' });
        const base = new Date(2021, 7, 1, 12); // Sunday
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(base);
            date.setDate(base.getDate() + i);
            return formatter.format(date);
        });
    }, [locale]);
    const todayIndex = new Date().getDay();

    // Calculate max for normalization
    const maxValue = Math.max(...weekData, 1);

    // Flip card state
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldAnimateCurve, setShouldAnimateCurve] = useState(false);

    // Handle flip with animation lock
    const handleFlip = useCallback(() => {
        if (isAnimating) return;
        triggerFeedback('tap');
        setIsAnimating(true);
        setIsFlipped(prev => {
            const newFlipped = !prev;
            // Trigger curve animation when flipping to front (showing chart)
            if (newFlipped) {
                setShouldAnimateCurve(true);
            } else {
                // Reset animation state when flipping back
                setShouldAnimateCurve(false);
            }
            return newFlipped;
        });
        // Unlock after animation completes (620ms)
        setTimeout(() => setIsAnimating(false), 620);
    }, [isAnimating]);

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

                {/* Rainbow Ring Avatar with hover rotation */}
                <div className="relative group cursor-pointer">
                    <div
                        className="w-14 h-14 rounded-full p-[3px] rainbow-ring transition-transform duration-500 group-hover:rotate-180"
                    >
                        <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:-rotate-180"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center transition-transform duration-500 group-hover:-rotate-180">
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
                            <span className="text-sm font-semibold text-slate-600">{t('home.todaysFlow')}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-slate-400">{t('home.weeklyTotal')}</span>
                            <p className="text-sm font-bold text-slate-600">
                                {Math.floor(weekData.reduce((a, b) => a + b, 0) / 60)}{t('home.unitHour')} {weekData.reduce((a, b) => a + b, 0) % 60}{t('home.unitMinute')}
                            </p>
                        </div>
                    </div>

                    {/* Time Display */}
                    <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-6xl font-bold text-slate-800 tracking-tight">
                            {todayTime.hours}
                        </span>
                        <span className="text-2xl font-semibold text-slate-500 mr-2">{t('home.unitHour')}</span>
                        <span className="text-6xl font-bold text-slate-800 tracking-tight">
                            {todayTime.minutes.toString().padStart(2, '0')}
                        </span>
                        <span className="text-2xl font-semibold text-slate-500">{t('home.unitMinute')}</span>
                    </div>

                    {/* Flow Curve Visualization - Flip Card */}
                    <div
                        className={`flip-card-container ${isFlipped ? 'flipped' : ''} ${isAnimating ? 'animating' : ''}`}
                        onClick={handleFlip}
                        style={{ height: '200px' }}
                    >
                        <div className="flip-card-inner">
                            {/* Back Face (shown by default) */}
                            <div className="flip-card-face flip-card-back flip-card-glass p-4">
                                <div className="h-full flex flex-col justify-between">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('home.thisWeeksFlow')}</span>
                                        {/* Flip hint icon */}
                                        <div className="flip-hint">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                                                <path d="M3 12C3 7.02944 7.02944 3 12 3C15.3542 3 18.2757 4.9069 19.6088 7.66668" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M16 8H20V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M21 12C21 16.9706 16.9706 21 12 21C8.64583 21 5.72434 19.0931 4.39124 16.3333" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8 16H4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Teaser content */}
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mb-3">
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 12C4 12 6 9 9 9C12 9 12 12 15 12C18 12 20 9 20 9" stroke="url(#teaserGradient)" strokeWidth="2.5" strokeLinecap="round" />
                                                <path d="M4 16C4 16 6 13 9 13C12 13 12 16 15 16C18 16 20 13 20 13" stroke="url(#teaserGradient)" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
                                                <defs>
                                                    <linearGradient id="teaserGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="var(--flow-line-start)" />
                                                        <stop offset="100%" stopColor="var(--flow-line-mid)" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600">{t('home.tapToViewFlow')}</p>
                                        <p className="text-xs text-slate-400 mt-1">{t('home.weeklyProgressChart')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Front Face (the chart - revealed on flip) */}
                            <div className="flip-card-face flip-card-front flip-card-glass p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('home.thisWeeksFlow')}</span>
                                    {/* Tap to flip back hint */}
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                                        <path d="M9 14L4 9L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M4 9H15C18.3137 9 21 11.6863 21 15V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
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
                                                <stop offset="0%" stopColor="var(--flow-line-start)" />
                                                <stop offset="50%" stopColor="var(--flow-line-mid)" />
                                                <stop offset="100%" stopColor="var(--flow-line-end)" />
                                            </linearGradient>
                                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="var(--flow-area-top)" />
                                                <stop offset="100%" stopColor="var(--flow-area-bottom)" />
                                            </linearGradient>
                                            <filter id="flowGlowLight">
                                                <feGaussianBlur stdDeviation="2.2" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                            <filter id="flowGlowDark">
                                                <feGaussianBlur stdDeviation="1.6" result="coloredBlur" />
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
                                            className={shouldAnimateCurve ? 'area-animate' : ''}
                                        />

                                        {/* Main flow curve */}
                                        <path
                                            d={generateFlowPath()}
                                            fill="none"
                                            stroke="url(#flowGradient)"
                                            strokeWidth="3"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter={isDarkMode ? 'url(#flowGlowDark)' : 'url(#flowGlowLight)'}
                                            className={shouldAnimateCurve ? 'curve-animate' : ''}
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
                                                <g key={index} className={shouldAnimateCurve ? `point-animate point-animate-${index}` : ''}>
                                                    {/* Outer glow for today */}
                                                    {isToday && (
                                                        <circle
                                                            cx={x}
                                                            cy={y}
                                                            r="8"
                                                            fill="var(--flow-today-glow)"
                                                            className="animate-pulse"
                                                        />
                                                    )}
                                                    {/* Point */}
                                                    <circle
                                                        cx={x}
                                                        cy={y}
                                                        r={isToday ? 5 : 4}
                                                        fill={isToday ? 'var(--flow-point-today)' : 'var(--flow-point)'}
                                                        stroke={isToday ? 'var(--flow-point-ring)' : 'url(#flowGradient)'}
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
                                                className="text-xs font-medium"
                                                style={{
                                                    color: index === todayIndex ? 'var(--flow-day-active)' : 'var(--flow-day-label)',
                                                    fontWeight: index === todayIndex ? 700 : 500,
                                                }}
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
            </div>
        </div>
    );
};

export default HomePage;
