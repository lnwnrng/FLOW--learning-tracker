import React, { useState } from 'react';
import FlowPortal from './FlowPortal';
import {
    ArrowLeft,
    Volume2,
    VolumeX,
    Vibrate,
    VibrateOff,
    Globe,
    Shield,
    HelpCircle,
    MessageSquare,
    ChevronRight,
    X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../stores';
import { normalizeLanguage, SUPPORTED_LANGUAGES } from '../i18n';
import { playSoundEffect, triggerHaptic, triggerFeedback } from '../services/feedbackService';

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
            <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${enabled ? `bg-gradient-to-br ${colorClass}` : 'bg-slate-200/50 ring-1 ring-white/10'
                    }`}
            >
                <Icon size={22} className={enabled ? 'text-white' : 'text-slate-500'} />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={`relative w-14 h-8 rounded-full transition-all duration-300 ${enabled
                    ? `bg-gradient-to-r ${colorClass}`
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
    title: string;
    description: string;
}

const ThemeModeToggle: React.FC<ThemeModeToggleProps> = ({ enabled, onToggle, title, description }) => (
    <div className="glass-card rounded-2xl p-4 ring-1 ring-white/10">
        <div className="flex items-center gap-4">
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: enabled ? '#183153' : '#73C0FC' }}
            >
                {enabled ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        width="22"
                        height="22"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path
                            fill="#73C0FC"
                            d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
                        />
                    </svg>
                ) : (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <g fill="#FFD43B">
                            <circle r="5" cy="12" cx="12" />
                            <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
                        </g>
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800">{title}</h4>
                <p className="text-sm text-slate-500 mt-0.5">
                    {description}
                </p>
            </div>
            <label className="theme-mode-switch">
                <span className="theme-mode-switch__sun" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g fill="#ffd43b">
                            <circle r="5" cy="12" cx="12" />
                            <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
                        </g>
                    </svg>
                </span>
                <span className="theme-mode-switch__moon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
                    </svg>
                </span>
                <input
                    type="checkbox"
                    className="theme-mode-switch__input"
                    checked={enabled}
                    onChange={(e) => onToggle(e.target.checked)}
                    aria-label={title}
                />
                <span className="theme-mode-switch__slider" aria-hidden="true" />
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

    const modal = (
        <div
            className="absolute left-0 right-0 bottom-0 z-[120] flex items-center justify-center p-4 flow-backdrop-strong"
            style={{
                top: 'var(--titlebar-height)',
                borderBottomLeftRadius: 'var(--window-radius)',
                borderBottomRightRadius: 'var(--window-radius)',
            }}
            onClick={() => {
                triggerFeedback('tap');
                onClose();
            }}
        >
            <div
                className="relative w-full max-w-sm rounded-3xl p-6 animate-fade-in flow-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden flow-modal-highlight" />
                <button
                    onClick={() => {
                        triggerFeedback('tap');
                        onClose();
                    }}
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

    // Avoid `position: fixed` inside transformed parents (e.g. `.animate-fade-in`).
    // Portal to the window frame so the backdrop starts exactly below the titlebar.
    return <FlowPortal>{modal}</FlowPortal>;
};

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
    const { t, i18n } = useTranslation();

    // Settings state
    const { settings, setSetting } = useSettingsStore();
    const themeMode = settings['themeMode'] === 'dark' ? 'dark' : 'light';
    const isDarkMode = themeMode === 'dark';
    const selectedLanguage = normalizeLanguage(settings['language']);
    const soundEnabled = settings['soundEffects'] !== 'off';
    const hapticEnabled = settings['hapticFeedback'] !== 'off';
    const [activeModal, setActiveModal] = useState<'language' | 'privacy' | 'support' | 'feedback' | null>(null);

    const languageLabels: Record<string, string> = {
        en: t('settings.language.valueEn'),
        zh: t('settings.language.valueZh'),
    };

    const getLanguageLabel = (language: string) => {
        return languageLabels[language] ?? language.toUpperCase();
    };

    const handleSelectLanguage = (language: 'en' | 'zh') => {
        i18n.changeLanguage(language).catch(() => undefined);
        void setSetting('language', language);
        triggerFeedback('toggleOn');
        setActiveModal(null);
    };

    return (
        <div className="animate-fade-in space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => {
                        triggerFeedback('nav');
                        onBack();
                    }}
                    className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-800 transition-colors ring-1 ring-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">{t('settings.title')}</h1>
                    <p className="text-sm text-slate-500">{t('settings.subtitle')}</p>
                </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">{t('settings.sections.appearance')}</h3>
                <ThemeModeToggle
                    enabled={isDarkMode}
                    onToggle={(next) => {
                        void setSetting('themeMode', next ? 'dark' : 'light');
                        triggerFeedback(next ? 'toggleOn' : 'toggleOff');
                    }}
                    title={t('settings.darkMode.title')}
                    description={isDarkMode ? t('settings.darkMode.toLight') : t('settings.darkMode.toDark')}
                />
            </div>

            {/* Sound & Haptics Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">{t('settings.sections.soundHaptics')}</h3>
                <SettingToggle
                    icon={soundEnabled ? Volume2 : VolumeX}
                    title={t('settings.sound.soundEffects.title')}
                    description={t('settings.sound.soundEffects.description')}
                    enabled={soundEnabled}
                    onToggle={() => {
                        const next = !soundEnabled;
                        void setSetting('soundEffects', next ? 'on' : 'off');
                        if (next) {
                            playSoundEffect('toggleOn', { force: true });
                        }
                    }}
                    colorClass="from-emerald-400 to-green-500"
                />
                <SettingToggle
                    icon={hapticEnabled ? Vibrate : VibrateOff}
                    title={t('settings.sound.haptics.title')}
                    description={t('settings.sound.haptics.description')}
                    enabled={hapticEnabled}
                    onToggle={() => {
                        const next = !hapticEnabled;
                        void setSetting('hapticFeedback', next ? 'on' : 'off');
                        if (next) {
                            triggerHaptic('toggleOn', { force: true });
                        }
                    }}
                    colorClass="from-rose-400 to-pink-500"
                />
            </div>

            {/* More Options Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide px-1">{t('settings.sections.more')}</h3>
                <SettingOption
                    icon={Globe}
                    title={t('settings.moreItems.language')}
                    value={selectedLanguage === 'zh' ? t('settings.language.valueZh') : t('settings.language.valueEn')}
                    onClick={() => {
                        triggerFeedback('modal');
                        setActiveModal('language');
                    }}
                    colorClass="from-cyan-400 to-teal-500"
                />
                <SettingOption
                    icon={Shield}
                    title={t('settings.moreItems.privacy')}
                    onClick={() => {
                        triggerFeedback('modal');
                        setActiveModal('privacy');
                    }}
                    colorClass="from-slate-500 to-slate-600"
                />
                <SettingOption
                    icon={HelpCircle}
                    title={t('settings.moreItems.support')}
                    onClick={() => {
                        triggerFeedback('modal');
                        setActiveModal('support');
                    }}
                    colorClass="from-violet-400 to-purple-500"
                />
                <SettingOption
                    icon={MessageSquare}
                    title={t('settings.moreItems.feedback')}
                    onClick={() => {
                        triggerFeedback('modal');
                        setActiveModal('feedback');
                    }}
                    colorClass="from-pink-400 to-rose-500"
                />
            </div>

            {/* App Version */}
            <div className="text-center py-4">
                <p className="text-sm text-slate-400">{t('settings.appVersion')}</p>
                <p className="text-xs text-slate-300 mt-1">{t('settings.madeWithLove')}</p>
            </div>

            <SettingsModal
                isOpen={activeModal === 'language'}
                title={t('settings.language.modalTitle')}
                onClose={() => setActiveModal(null)}
            >
                <div className="space-y-3">
                    <p>{t('settings.language.modalDesc')}</p>
                    <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-2">
                        {SUPPORTED_LANGUAGES.map((language) => {
                            const isActive = selectedLanguage === language;
                            return (
                                <button
                                    key={language}
                                    onClick={() => handleSelectLanguage(language)}
                                    className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition-all border flex items-center justify-between ${
                                        isActive
                                            ? 'bg-slate-900/90 text-white border-slate-900/80'
                                            : 'bg-white/40 text-slate-600 border-white/50 hover:bg-white/60'
                                    }`}
                                >
                                    <span>{getLanguageLabel(language)}</span>
                                    {isActive && (
                                        <span className="text-xs uppercase tracking-[0.2em] text-white/70">
                                            {t('settings.language.active')}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SettingsModal>

            <SettingsModal
                isOpen={activeModal === 'privacy'}
                title={t('settings.privacy.title')}
                onClose={() => setActiveModal(null)}
            >
                <p>{t('settings.privacy.p1')}</p>
                <div className="space-y-2">
                    <p>{t('settings.privacy.p2Title')}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>{t('settings.privacy.list.sessions')}</li>
                        <li>{t('settings.privacy.list.tasks')}</li>
                        <li>{t('settings.privacy.list.preferences')}</li>
                    </ul>
                </div>
                <p>{t('settings.privacy.p3')}</p>
            </SettingsModal>

            <SettingsModal
                isOpen={activeModal === 'support'}
                title={t('settings.support.title')}
                onClose={() => setActiveModal(null)}
            >
                <p>{t('settings.support.p1')}</p>
                <div className="space-y-2">
                    <p>{t('settings.support.tipsTitle')}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>{t('settings.support.tips.t1')}</li>
                        <li>{t('settings.support.tips.t2')}</li>
                        <li>{t('settings.support.tips.t3')}</li>
                    </ul>
                </div>
                <p>{t('settings.support.p2')}</p>
            </SettingsModal>

            <SettingsModal
                isOpen={activeModal === 'feedback'}
                title={t('settings.feedback.title')}
                onClose={() => setActiveModal(null)}
            >
                <p>{t('settings.feedback.p1')}</p>
                <div className="space-y-2">
                    <p>{t('settings.feedback.topicsTitle')}</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>{t('settings.feedback.topics.t1')}</li>
                        <li>{t('settings.feedback.topics.t2')}</li>
                        <li>{t('settings.feedback.topics.t3')}</li>
                    </ul>
                </div>
                <p>{t('settings.feedback.p2')}</p>
            </SettingsModal>
        </div>
    );
};

export default SettingsPage;

