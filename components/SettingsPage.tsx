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
    Globe,
    Shield,
    HelpCircle,
    MessageSquare,
    ChevronRight,
    X
} from 'lucide-react';
import { useSettingsStore } from '../stores';

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

interface ThemeModeToggleProps {
    enabled: boolean;
    onToggle: (next: boolean) => void;
}

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({ enabled, onToggle }) => (
    <div className="glass-card rounded-2xl p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                {enabled ? <Moon size={22} className="text-white" /> : <Sun size={22} className="text-white" />}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800">Dark Mode</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                    {enabled ? 'Switch to light theme' : 'Switch to dark theme'}
                </p>
            </div>
            <label className="theme-switch">
                <input
                    type="checkbox"
                    className="theme-switch__checkbox"
                    checked={enabled}
                    onChange={(e) => onToggle(e.target.checked)}
                />
                <div className="theme-switch__container">
                    <div className="theme-switch__clouds"></div>
                    <div className="theme-switch__stars-container">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div className="theme-switch__circle-container">
                        <div className="theme-switch__sun-moon-container">
                            <div className="theme-switch__moon">
                                <div className="theme-switch__spot"></div>
                                <div className="theme-switch__spot"></div>
                                <div className="theme-switch__spot"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </label>
        </div>
    </div>
);

interface SettingsModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    title,
    onClose,
    children
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 flow-backdrop-strong" onClick={onClose}>
            <div
                className="relative w-full max-w-sm rounded-3xl p-6 animate-fade-in flow-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden flow-modal-highlight" />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-white/20 transition-all"
                >
                    <X size={18} />
                </button>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
                <div className="space-y-3 text-sm text-slate-500 max-h-[60vh] overflow-y-auto pr-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    // Settings state
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);
    const [vibration, setVibration] = useState(true);
    const [focusReminder, setFocusReminder] = useState(true);
    const { settings, setSetting } = useSettingsStore();
    const themeMode = settings['themeMode'] === 'dark' ? 'dark' : 'light';
    const isDarkMode = themeMode === 'dark';
    const rawLanguage = settings['language'];
    const selectedLanguage = rawLanguage === 'zh' ? 'zh' : 'en';
    const [activeModal, setActiveModal] = useState<'language' | 'privacy' | 'support' | 'feedback' | null>(null);

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

            {/* Appearance Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">Appearance</h3>
                <ThemeModeToggle
                    enabled={isDarkMode}
                    onToggle={(next) => void setSetting('themeMode', next ? 'dark' : 'light')}
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
                    value={selectedLanguage === 'zh' ? '中文' : 'English'}
                    onClick={() => setActiveModal('language')}
                    colorClass="from-cyan-400 to-teal-500"
                />
                <SettingOption
                    icon={Shield}
                    title="Privacy Policy"
                    onClick={() => setActiveModal('privacy')}
                    colorClass="from-slate-500 to-slate-600"
                />
                <SettingOption
                    icon={HelpCircle}
                    title="Help & Support"
                    onClick={() => setActiveModal('support')}
                    colorClass="from-violet-400 to-purple-500"
                />
                <SettingOption
                    icon={MessageSquare}
                    title="Send Feedback"
                    onClick={() => setActiveModal('feedback')}
                    colorClass="from-pink-400 to-rose-500"
                />
            </div>

            {/* App Version */}
            <div className="text-center py-4">
                <p className="text-sm text-slate-400">Flow v1.0.0</p>
                <p className="text-xs text-slate-300 mt-1">Made with love</p>
            </div>

            <SettingsModal
                isOpen={activeModal === 'language'}
                title="Language"
                onClose={() => setActiveModal(null)}
            >
                <div className="space-y-3">
                    <p>Select your preferred language.</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => void setSetting('language', 'en')}
                            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all border ${
                                selectedLanguage === 'en'
                                    ? 'bg-slate-900/90 text-white border-slate-900/80'
                                    : 'bg-white/40 text-slate-600 border-white/50'
                            }`}
                        >
                            English
                        </button>
                        <button
                            onClick={() => void setSetting('language', 'zh')}
                            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all border ${
                                selectedLanguage === 'zh'
                                    ? 'bg-slate-900/90 text-white border-slate-900/80'
                                    : 'bg-white/40 text-slate-600 border-white/50'
                            }`}
                        >
                            中文
                        </button>
                    </div>
                </div>
            </SettingsModal>

            <SettingsModal
                isOpen={activeModal === 'privacy'}
                title="Privacy Policy"
                onClose={() => setActiveModal(null)}
            >
                <p>
                    Flow stores your data locally on your device by default. We do not upload your
                    focus sessions, tasks, or settings unless you explicitly enable sync in a future update.
                </p>
                <div className="space-y-2">
                    <p>What we store locally:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Focus sessions and statistics</li>
                        <li>Tasks and schedules</li>
                        <li>Achievements and preferences</li>
                    </ul>
                </div>
                <p>
                    If you delete a user profile, all related data will be removed from this device.
                </p>
            </SettingsModal>

            <SettingsModal
                isOpen={activeModal === 'support'}
                title="Help & Support"
                onClose={() => setActiveModal(null)}
            >
                <p>Need help getting the most out of Flow?</p>
                <div className="space-y-2">
                    <p>Quick tips:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Tap the focus orb to start or pause a session.</li>
                        <li>Sessions under 1 minute are not recorded.</li>
                        <li>Unlock achievements by completing consistent sessions.</li>
                    </ul>
                </div>
                <p>More help content will be added in upcoming releases.</p>
            </SettingsModal>

            <SettingsModal
                isOpen={activeModal === 'feedback'}
                title="Send Feedback"
                onClose={() => setActiveModal(null)}
            >
                <p>
                    We would love to hear your thoughts. Tell us what you like, what feels off,
                    and what you want next.
                </p>
                <div className="space-y-2">
                    <p>Suggested topics:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>UI/UX suggestions</li>
                        <li>Feature requests</li>
                        <li>Bug reports</li>
                    </ul>
                </div>
                <p>Feedback submission will be connected in a future update.</p>
            </SettingsModal>
        </div>
    );
};

export default SettingsPage;

