import React from 'react';
import { Home, BarChart2, User, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tab } from '../types';
import { triggerFeedback } from '../services/feedbackService';

interface DockProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  isTimerRunning?: boolean;
}

// Custom Flow Icon - water drop with wave/flow motion
const FlowIcon: React.FC<{ size?: number; isAnimating?: boolean }> = ({ size = 28, isAnimating = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={isAnimating ? 'flow-icon-animating' : ''}
  >
    {/* Flowing wave shape */}
    <path
      d="M4 12C4 12 6 9 9 9C12 9 12 12 15 12C18 12 20 9 20 9"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={isAnimating ? 'flow-wave-path' : ''}
    />
    <path
      d="M4 16C4 16 6 13 9 13C12 13 12 16 15 16C18 16 20 13 20 13"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
      className={isAnimating ? 'flow-wave-path-delayed' : ''}
    />
  </svg>
);

// Define colors for each nav item
const navItemColors = {
  [Tab.HOME]: {
    active: 'bg-emerald-100 text-emerald-600',
    hover: 'hover:bg-emerald-50 hover:text-emerald-500',
  },
  [Tab.STATS]: {
    active: 'bg-amber-100 text-amber-600',
    hover: 'hover:bg-amber-50 hover:text-amber-500',
  },
  [Tab.FOCUS]: {
    active: '',
    hover: '',
  },
  [Tab.USER]: {
    active: 'bg-violet-100 text-violet-600',
    hover: 'hover:bg-violet-50 hover:text-violet-500',
  },
  [Tab.SCHEDULE]: {
    active: 'bg-sky-100 text-sky-600',
    hover: 'hover:bg-sky-50 hover:text-sky-500',
  },
};

const Dock: React.FC<DockProps> = ({ activeTab, setActiveTab, isTimerRunning = false }) => {
  const { t } = useTranslation();

  const navItems = [
    { id: Tab.HOME, icon: Home, label: t('dock.home') },
    { id: Tab.STATS, icon: BarChart2, label: t('dock.stats') },
    { id: Tab.FOCUS, icon: null, label: t('dock.focus'), isPrimary: true },
    { id: Tab.USER, icon: User, label: t('dock.profile') },
    { id: Tab.SCHEDULE, icon: CalendarDays, label: t('dock.schedule') },
  ];

  return (
    <>
      <div className="fixed z-50 
        bottom-5 left-1/2 -translate-x-1/2 w-[88%] max-w-md
        md:bottom-auto md:top-1/2 md:left-6 md:-translate-y-1/2 md:w-auto md:max-w-none md:translate-x-0
      ">
        <nav className="
          glass-dock
          rounded-[2rem] px-4 py-2.5 flex items-center justify-around
          md:flex-col md:px-3 md:py-6 md:gap-2 md:h-auto
          transition-all duration-500 ease-out
        ">
          {navItems.map((item, index) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            const colors = navItemColors[item.id];

            // Primary 'Focus' Button with multi-color gradient
            if (item.isPrimary) {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerFeedback('nav');
                    setActiveTab(item.id);
                  }}
                  className={`
                    group relative flex items-center justify-center
                    w-14 h-14 md:w-12 md:h-12 rounded-full 
                    bg-gradient-to-br from-rose-400 via-violet-500 to-cyan-400
                    shadow-lg shadow-violet-400/40
                    hover:scale-110 hover:shadow-xl hover:shadow-violet-500/50
                    active:scale-95
                    transition-all duration-300 ease-out
                    -my-3 md:my-2
                    ${isTimerRunning ? 'dock-breathing' : ''}
                  `}
                  aria-label={item.label}
                >
                  <FlowIcon size={26} isAnimating={isTimerRunning} />

                  {/* Tooltip */}
                  <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:block whitespace-nowrap pointer-events-none shadow-lg">
                    {t('dock.startFlow')}
                  </span>
                </button>
              );
            }

            // Standard Nav Items with unique colors
            return (
              <button
                key={item.id}
                onClick={() => {
                  triggerFeedback('nav');
                  setActiveTab(item.id);
                }}
                className={`
                  group relative flex items-center justify-center
                  w-11 h-11 md:w-10 md:h-10 rounded-2xl
                  transition-all duration-300 ease-out
                  ${isActive
                    ? colors.active
                    : `text-slate-400 ${colors.hover}`
                  }
                `}
                aria-label={item.label}
              >
                {Icon && (
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Dock;
