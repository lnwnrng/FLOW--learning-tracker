import React, { useEffect, useRef, useState } from 'react';
import { Crown, Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { triggerFeedback } from '../services/feedbackService';

interface PremiumSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Particle class for confetti
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

const PremiumSuccessModal: React.FC<PremiumSuccessModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number>();
    const [showContent, setShowContent] = useState(false);
    const [checkedItems, setCheckedItems] = useState<number[]>([]);
    const didPlayFeedback = useRef(false);

    const benefits = [
        t('premium.features.unlimitedSessions'),
        t('premium.features.advancedStats'),
        t('premium.features.cloudSyncAcross'),
        t('premium.features.customThemesColors'),
    ];

    // Confetti colors - golden/amber palette
    const confettiColors = [
        '#fbbf24', // amber-400
        '#f59e0b', // amber-500
        '#d97706', // amber-600
        '#fcd34d', // amber-300
        '#fdba74', // orange-300
        '#fb923c', // orange-400
        '#ffffff', // white highlights
        '#fef3c7', // amber-100
    ];

    // Create burst of particles from a position
    const createBurst = (x: number, y: number, count: number) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const speed = 8 + Math.random() * 12;
            newParticles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5,
                size: 4 + Math.random() * 8,
                color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 20,
                opacity: 1,
                shape: Math.random() > 0.5 ? 'rect' : 'circle',
            });
        }
        return newParticles;
    };

    // Initialize confetti animation
    useEffect(() => {
        if (!isOpen) {
            setShowContent(false);
            setCheckedItems([]);
            particlesRef.current = [];
            didPlayFeedback.current = false;
            return;
        }

        if (!didPlayFeedback.current) {
            triggerFeedback('premium');
            didPlayFeedback.current = true;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create initial bursts from both sides
        setTimeout(() => {
            // Left side burst
            particlesRef.current = [
                ...particlesRef.current,
                ...createBurst(50, canvas.height * 0.4, 40),
            ];
        }, 100);

        setTimeout(() => {
            // Right side burst
            particlesRef.current = [
                ...particlesRef.current,
                ...createBurst(canvas.width - 50, canvas.height * 0.4, 40),
            ];
        }, 200);

        setTimeout(() => {
            // Center burst
            particlesRef.current = [
                ...particlesRef.current,
                ...createBurst(canvas.width / 2, canvas.height * 0.3, 50),
            ];
        }, 400);

        // Show content after initial burst
        setTimeout(() => setShowContent(true), 300);

        // Animate checkmarks sequentially
        benefits.forEach((_, index) => {
            setTimeout(() => {
                setCheckedItems((prev) => [...prev, index]);
            }, 800 + index * 200);
        });

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current = particlesRef.current.filter((p) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.3; // gravity
                p.vx *= 0.99; // air resistance
                p.rotation += p.rotationSpeed;
                p.opacity -= 0.008;

                // Draw particle
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

        // Handle resize
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center">
            {/* Confetti Canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1 }}
            />

            {/* Backdrop */}
            <div
                className="absolute inset-0 transition-opacity duration-500 flow-backdrop-strong"
                style={{
                    opacity: showContent ? 1 : 0,
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
                    relative z-10 w-full max-w-sm mx-4 rounded-3xl p-8
                    transition-all duration-500
                    ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                `}
                style={{
                    background: 'var(--premium-surface)',
                    border: '1px solid var(--premium-border)',
                    boxShadow: 'var(--premium-shadow)',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Glass highlight */}
                <div
                    className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
                    style={{
                        background: 'var(--premium-highlight)',
                    }}
                />

                {/* Crown Icon with Glow */}
                <div className="relative flex justify-center mb-6">
                    {/* Glow effect */}
                    <div
                        className="absolute w-24 h-24 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)',
                            animation: 'crownGlow 2s ease-in-out infinite',
                        }}
                    />
                    {/* Crown container */}
                    <div
                        className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                            boxShadow: '0 8px 30px -8px rgba(251, 191, 36, 0.6)',
                        }}
                    >
                        <Crown size={40} className="text-white" strokeWidth={2} />
                        {/* Sparkle accents */}
                        <Sparkles
                            size={16}
                            className="absolute -top-1 -right-1 text-amber-300"
                            style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
                    {t('premium.successModal.title')}
                </h2>
                <p className="text-center text-slate-500 text-sm mb-6">
                    {t('premium.successModal.subtitle')}
                </p>

                {/* Benefits List */}
                <div className="space-y-3 mb-8">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className={`
                                flex items-center gap-3 p-3 rounded-xl
                                transition-all duration-300
                                ${checkedItems.includes(index) ? 'opacity-100' : 'opacity-40'}
                            `}
                            style={{
                                background: 'var(--premium-item-surface)',
                                border: '1px solid var(--premium-item-border)',
                            }}
                        >
                            {/* Checkmark */}
                            <div
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center
                                    transition-all duration-300
                                    ${checkedItems.includes(index
                                ) ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 scale-100'
                                        : 'bg-slate-200 scale-75'
                                    }
                                `}
                            >
                                <Check
                                    size={14}
                                    className={`
                                        text-white transition-all duration-300
                                        ${checkedItems.includes(index) ? 'opacity-100' : 'opacity-0'}
                                    `}
                                    strokeWidth={3}
                                />
                            </div>
                            {/* Benefit text */}
                            <span className="text-sm font-medium text-slate-700">
                                {benefit}
                            </span>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => {
                        triggerFeedback('tap');
                        onClose();
                    }}
                    className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                        boxShadow: '0 8px 24px -8px rgba(251, 191, 36, 0.5)',
                    }}
                >
                    {t('premium.successModal.startExploring')}
                </button>
            </div>
        </div>
    );
};

export default PremiumSuccessModal;
