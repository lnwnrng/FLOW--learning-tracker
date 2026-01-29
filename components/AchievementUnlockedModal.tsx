import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Trophy, ChevronRight } from 'lucide-react';
import type { AchievementType } from '../types';
import { achievementDisplay } from './achievementDisplay';

interface AchievementUnlockedModalProps {
    isOpen: boolean;
    achievements: AchievementType[];
    onClose: () => void;
    onView?: () => void;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: 'rect' | 'circle';
}

const AchievementUnlockedModal: React.FC<AchievementUnlockedModalProps> = ({
    isOpen,
    achievements,
    onClose,
    onView,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const [showContent, setShowContent] = useState(false);

    const confettiColors = [
        '#22d3ee',
        '#34d399',
        '#60a5fa',
        '#a78bfa',
        '#fbbf24',
        '#f59e0b',
        '#ffffff',
    ];

    const createBurst = (x: number, y: number, count: number) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 7 + Math.random() * 10;
            newParticles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                size: 4 + Math.random() * 7,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 18,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
            });
        }
        return newParticles;
    };

    useEffect(() => {
        if (!isOpen) {
            setShowContent(false);
            particlesRef.current = [];
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        setTimeout(() => {
            particlesRef.current = [
                ...particlesRef.current,
                ...createBurst(60, canvas.height * 0.35, 36),
            ];
        }, 80);

        setTimeout(() => {
            particlesRef.current = [
                ...particlesRef.current,
                ...createBurst(canvas.width - 60, canvas.height * 0.35, 36),
            ];
        }, 160);

        setTimeout(() => {
            particlesRef.current = [
                ...particlesRef.current,
                ...createBurst(canvas.width / 2, canvas.height * 0.28, 48),
            ];
        }, 240);

        setTimeout(() => setShowContent(true), 220);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.28;
                p.vx *= 0.985;
                p.rotation += p.rotationSpeed;
                p.opacity -= 0.01;

                if (p.opacity > 0) {
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rotation * Math.PI) / 180);
                    ctx.globalAlpha = p.opacity;
                    ctx.fillStyle = p.color;

                    if (p.shape === 'rect') {
                        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                    } else {
                        ctx.beginPath();
                        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                        ctx.fill();
                    }

                    ctx.restore();
                }

                return p.opacity > 0 && p.y < canvas.height + 50;
            });

            if (particlesRef.current.length > 0 || isOpen) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        animate();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
            />

            <div
                className="absolute inset-0 transition-opacity duration-500 flow-backdrop-strong"
                style={{
                    opacity: showContent ? 1 : 0,
                }}
                onClick={onClose}
            />

            <div
                className={`
                    relative z-10 w-full max-w-sm mx-4 rounded-3xl p-7
                    transition-all duration-500
                    ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                `}
                style={{
                    background: 'var(--achievement-surface)',
                    border: '1px solid var(--achievement-border)',
                    boxShadow: 'var(--achievement-shadow)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
                    style={{
                        background: 'var(--achievement-highlight)',
                    }}
                />

                <div className="relative flex justify-center mb-5">
                    <div
                        className="absolute w-24 h-24 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)',
                            animation: 'crownGlow 2s ease-in-out infinite',
                        }}
                    />
                    <div
                        className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 60%, #22d3ee 100%)',
                            boxShadow: '0 8px 30px -8px rgba(56, 189, 248, 0.5)',
                        }}
                    >
                        <Trophy size={38} className="text-white" strokeWidth={2} />
                        <Sparkles
                            size={16}
                            className="absolute -top-1 -right-1 text-sky-200"
                            style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                    Achievement Unlocked
                </h2>
                <p className="text-center text-slate-500 text-sm mb-6">
                    You unlocked {achievements.length} new {achievements.length === 1 ? 'achievement' : 'achievements'}.
                </p>

                <div className="space-y-3 mb-6">
                    {achievements.map((type) => {
                        const display = achievementDisplay[type];
                        const Icon = display?.icon ?? Trophy;
                        return (
                            <div
                                key={type}
                                className="flex items-center gap-3 p-3 rounded-2xl"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    border: '1px solid rgba(255, 255, 255, 0.7)',
                                }}
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${display?.color ?? 'from-slate-400 to-slate-500'} flex items-center justify-center`}>
                                    <Icon size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{display?.title ?? type}</p>
                                    <p className="text-xs text-slate-500">{display?.description ?? 'Achievement unlocked'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    {onView && (
                        <button
                            onClick={onView}
                            className="flex-1 py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{
                                background: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)',
                                boxShadow: '0 8px 24px -8px rgba(56, 189, 248, 0.45)',
                            }}
                        >
                            View
                            <ChevronRight size={16} />
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                            background: 'rgba(248, 250, 252, 0.9)',
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            color: '#475569',
                        }}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementUnlockedModal;
