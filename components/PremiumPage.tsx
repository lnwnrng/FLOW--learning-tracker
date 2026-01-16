import React, { useState } from 'react';
import { ArrowLeft, Crown, Check, Sparkles, Zap, Shield, Clock } from 'lucide-react';

interface PremiumPageProps {
    onBack: () => void;
    isPremium?: boolean;
    onUpgrade?: () => void;
}

const PremiumPage: React.FC<PremiumPageProps> = ({
    onBack,
    isPremium = false,
    onUpgrade,
}) => {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

    const features = [
        {
            icon: Clock,
            title: 'Unlimited Focus Sessions',
            description: 'No daily limits on focus time',
        },
        {
            icon: Sparkles,
            title: 'Advanced Statistics',
            description: 'Detailed insights and trends',
        },
        {
            icon: Shield,
            title: 'Cloud Sync',
            description: 'Access data across all devices',
        },
        {
            icon: Zap,
            title: 'Custom Themes',
            description: 'Personalize your experience',
        },
    ];

    const plans = {
        monthly: {
            price: '$4.99',
            period: '/month',
            savings: null,
        },
        yearly: {
            price: '$39.99',
            period: '/year',
            savings: 'Save 33%',
        },
    };

    if (isPremium) {
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
                    <h1 className="text-2xl font-bold text-slate-800">Premium</h1>
                </div>

                {/* Premium Active Card */}
                <div className="glass-card rounded-3xl p-6 ring-1 ring-white/10 bg-gradient-to-br from-amber-50/50 to-yellow-50/50">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Crown size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">You're Premium!</h2>
                        <p className="text-slate-500 mt-2">Enjoy all premium features</p>
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-600 rounded-full text-sm font-semibold">
                            <Check size={16} />
                            Active Subscription
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                    <h3 className="text-lg font-bold text-slate-800">Your Benefits</h3>
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="glass-card rounded-2xl p-4 ring-1 ring-white/10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                                    <Icon size={22} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{feature.title}</h4>
                                    <p className="text-sm text-slate-500">{feature.description}</p>
                                </div>
                                <Check size={20} className="text-emerald-500 ml-auto" />
                            </div>
                        );
                    })}
                </div>
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
                <h1 className="text-2xl font-bold text-slate-800">Upgrade to Premium</h1>
            </div>

            {/* Hero */}
            <div
                className="rounded-3xl p-6 text-center"
                style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                }}
            >
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Flow Premium</h2>
                <p className="text-white/80 mt-2">Unlock your full potential</p>
            </div>

            {/* Plan Selection */}
            <div className="grid grid-cols-2 gap-3">
                {(['monthly', 'yearly'] as const).map((plan) => (
                    <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`glass-card rounded-2xl p-4 ring-1 transition-all ${selectedPlan === plan
                                ? 'ring-amber-400 ring-2'
                                : 'ring-white/10'
                            }`}
                    >
                        <p className="text-xs text-slate-500 uppercase font-semibold">
                            {plan === 'monthly' ? 'Monthly' : 'Yearly'}
                        </p>
                        <p className="text-2xl font-bold text-slate-800 mt-1">
                            {plans[plan].price}
                        </p>
                        <p className="text-xs text-slate-400">{plans[plan].period}</p>
                        {plans[plan].savings && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full">
                                {plans[plan].savings}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Features */}
            <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">What you get</h3>
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <div key={index} className="glass-card rounded-2xl p-4 ring-1 ring-white/10 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                                <Icon size={22} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-800">{feature.title}</h4>
                                <p className="text-sm text-slate-500">{feature.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CTA Button */}
            <button
                onClick={onUpgrade}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:shadow-amber-500/40 active:scale-[0.98]"
                style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                }}
            >
                Start Free Trial
            </button>
            <p className="text-center text-xs text-slate-400">
                7-day free trial, cancel anytime
            </p>
        </div>
    );
};

export default PremiumPage;
