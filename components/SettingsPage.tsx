import React, { useState } from 'react';
import {
    ArrowLeft,
    Bell,
    Moon,
    Sun,
    Volume2,
    VolumeX,
    Vibrate,
    Clock,
    Palette,
    Globe,
    Shield,
    HelpCircle,
    MessageSquare,
    ChevronRight,
    Check
} from 'lucide-react';

interface SettingsPageProps {
    onBack: () => void;
}

interface SettingToggleProps {
    icon: React.ElementType;
    title: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
    colorClass?: string;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
    icon: Icon,
    title,
    description,
    enabled,
    onToggle,
    colorClass = 'from-violet-500 to-purple-600'
}) => (
    <div className="glass-card rounded-2xl p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${enabled
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                    : 'bg-slate-200'
                    }`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${enabled ? 'left-7' : 'left-1'
                    }`} />
            </button>
        </div>
    </div>
);

interface SettingOptionProps {
    icon: React.ElementType;
    title: string;
    value?: string;
    onClick?: () => void;
    colorClass?: string;
}

const SettingOption: React.FC<SettingOptionProps> = ({
    icon: Icon,
    title,
    value,
    onClick,
    colorClass = 'from-slate-400 to-slate-500'
}) => (
    <button
        onClick={onClick}
        className="w-full glass-card rounded-2xl p-4 ring-1 ring-white/10 hover:bg-white/60 transition-all"
    >
        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0 text-left">
                <h4 className="font-semibold text-slate-800">{title}</h4>
                {value && <p className="text-sm text-slate-500 mt-0.5">{value}</p>}
            </div>
            <ChevronRight size={20} className="text-slate-400" />
        </div>
    </button>
);

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    // Settings state
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [sound, setSound] = useState(true);
    const [vibration, setVibration] = useState(true);
    const [focusReminder, setFocusReminder] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState<'violet' | 'sky' | 'emerald' | 'rose'>('violet');

    const themeColors = [
        { id: 'violet' as const, gradient: 'from-violet-500 to-purple-600', ring: 'ring-violet-400' },
        { id: 'sky' as const, gradient: 'from-sky-400 to-blue-500', ring: 'ring-sky-400' },
        { id: 'emerald' as const, gradient: 'from-emerald-400 to-green-500', ring: 'ring-emerald-400' },
        { id: 'rose' as const, gradient: 'from-rose-400 to-pink-500', ring: 'ring-rose-400' },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors ring-1 ring-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                    <p className="text-sm text-slate-500">Customize your experience</p>
                </div>
            </div>

            {/* Theme Selection Card */}
            <div className="glass-card rounded-3xl p-6 ring-1 ring-white/10">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Palette size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Theme Color</h3>
                        <p className="text-sm text-slate-500">Choose your accent color</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {themeColors.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme.id)}
                            className={`
                                relative w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient}
                                transition-all duration-300 hover:scale-105
                                ${selectedTheme === theme.id ? `ring-4 ${theme.ring} ring-offset-2 ring-offset-white/80` : ''}
                            `}
                        >
                            {selectedTheme === theme.id && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Check size={24} className="text-white drop-shadow-lg" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">Appearance</h3>
                <SettingToggle
                    icon={darkMode ? Moon : Sun}
                    title="Dark Mode"
                    description="Switch to dark theme"
                    enabled={darkMode}
                    onToggle={() => setDarkMode(!darkMode)}
                    colorClass="from-indigo-500 to-purple-600"
                />
            </div>

            {/* Notifications Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">Notifications</h3>
                <SettingToggle
                    icon={Bell}
                    title="Push Notifications"
                    description="Get reminders and updates"
                    enabled={notifications}
                    onToggle={() => setNotifications(!notifications)}
                    colorClass="from-amber-400 to-orange-500"
                />
                <SettingToggle
                    icon={Clock}
                    title="Focus Reminders"
                    description="Daily reminder to focus"
                    enabled={focusReminder}
                    onToggle={() => setFocusReminder(!focusReminder)}
                    colorClass="from-sky-400 to-blue-500"
                />
            </div>

            {/* Sound & Haptics Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">Sound & Haptics</h3>
                <SettingToggle
                    icon={sound ? Volume2 : VolumeX}
                    title="Sound Effects"
                    description="Play sounds on actions"
                    enabled={sound}
                    onToggle={() => setSound(!sound)}
                    colorClass="from-emerald-400 to-green-500"
                />
                <SettingToggle
                    icon={Vibrate}
                    title="Haptic Feedback"
                    description="Vibrate on interactions"
                    enabled={vibration}
                    onToggle={() => setVibration(!vibration)}
                    colorClass="from-rose-400 to-pink-500"
                />
            </div>

            {/* More Options Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">More</h3>
                <SettingOption
                    icon={Globe}
                    title="Language"
                    value="English"
                    colorClass="from-cyan-400 to-teal-500"
                />
                <SettingOption
                    icon={Shield}
                    title="Privacy Policy"
                    colorClass="from-slate-500 to-slate-600"
                />
                <SettingOption
                    icon={HelpCircle}
                    title="Help & Support"
                    colorClass="from-violet-400 to-purple-500"
                />
                <SettingOption
                    icon={MessageSquare}
                    title="Send Feedback"
                    colorClass="from-pink-400 to-rose-500"
                />
            </div>

            {/* App Version */}
            <div className="text-center py-4">
                <p className="text-sm text-slate-400">Flow v1.0.0</p>
                <p className="text-xs text-slate-300 mt-1">Made with love</p>
            </div>
        </div>
    );
};

export default SettingsPage;

