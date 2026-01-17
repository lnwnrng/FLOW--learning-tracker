import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dock from './components/Dock';
import Calendar from './components/Calendar';
import TaskList from './components/TaskList';
import AddTaskModal from './components/AddTaskModal';
import UserProfile from './components/UserProfile';
import StatsPage from './components/StatsPage';
import FocusTimer from './components/FocusTimer';
import HomePage from './components/HomePage';
import AchievementsPage from './components/AchievementsPage';
import PremiumPage from './components/PremiumPage';
import SettingsPage from './components/SettingsPage';
import { ToastProvider, useToast } from './components/ToastNotification';
import PremiumSuccessModal from './components/PremiumSuccessModal';
import { Tab, Task, TaskCategory } from './types';
import { useUserStore, useSessionStore, useTaskStore } from './stores';
import { checkAndUnlockAchievements } from './services/achievementService';

// Category to color mapping for calendar dots
const categoryDotColors: Record<TaskCategory, string> = {
  'Reminder': 'bg-sky-400',
  'To Do': 'bg-emerald-400',
  'Event': 'bg-violet-400',
};

// Onboarding component for new users
const OnboardingScreen: React.FC<{ onCreateUser: (name: string) => void; isLoading: boolean }> = ({
  onCreateUser,
  isLoading
}) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateUser(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-sky-50 p-6">
      <div className="w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-8 shadow-xl border border-white/50">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <svg width="80" height="80" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#bg)" />
                <path d="M6 14C6 14 9 10 13 10C17 10 17 14 21 14C25 14 28 10 28 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 20C6 20 9 16 13 16C17 16 17 20 21 20C25 20 28 16 28 16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-sky-600 bg-clip-text text-transparent">
              Welcome to Flow
            </h1>
            <p className="text-slate-600 mt-2">Your personal focus companion</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl bg-white/80 border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-sky-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Creating...' : 'Get Started'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [subPage, setSubPage] = useState<'achievements' | 'settings' | 'premium' | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Zustand stores
  const { user, isLoading: userLoading, isInitialized, initialize, createUser, updateUser, logout } = useUserStore();
  const {
    dailyStats,
    userStats,
    createSession,
    fetchDailyStats,
    fetchUserStats,
    getTodayFocusSeconds,
    getWeekData
  } = useSessionStore();
  const { tasks, fetchAllTasks, toggleTask, createTask } = useTaskStore();

  // Timer state - lifted from FocusTimer to persist across page navigation
  const [timerOrbState, setTimerOrbState] = useState<'idle' | 'forming' | 'running' | 'dissolving'>('idle');
  const [timerElapsedTime, setTimerElapsedTime] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  const timerStartTimeRef = useRef<number | null>(null);
  const sessionStartRef = useRef<Date | null>(null);

  const isTimerRunning = timerOrbState === 'running';

  // Initialize app - fetch user and data
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Fetch data when user is available
  useEffect(() => {
    if (user) {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      fetchDailyStats(
        weekAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      fetchUserStats();
      fetchAllTasks();
    }
  }, [user, fetchDailyStats, fetchUserStats, fetchAllTasks]);

  // Timer interval logic - runs at App level so it persists
  useEffect(() => {
    if (isTimerRunning) {
      timerStartTimeRef.current = Date.now() - timerElapsedTime * 1000;
      timerIntervalRef.current = window.setInterval(() => {
        if (timerStartTimeRef.current) {
          setTimerElapsedTime(Math.floor((Date.now() - timerStartTimeRef.current) / 1000));
        }
      }, 100);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  // Timer controls
  const handleTimerStart = useCallback(() => {
    if (timerOrbState === 'idle') {
      sessionStartRef.current = new Date();
      setTimerOrbState('forming');
      setTimeout(() => setTimerOrbState('running'), 500);
    }
  }, [timerOrbState]);

  const handleTimerPause = useCallback(() => {
    if (timerOrbState === 'running') {
      setTimerOrbState('dissolving');
      setTimeout(() => setTimerOrbState('idle'), 400);
    }
  }, [timerOrbState]);

  const handleTimerReset = useCallback(() => {
    if (timerOrbState === 'running') {
      setTimerOrbState('dissolving');
      setTimeout(() => {
        setTimerOrbState('idle');
        setTimerElapsedTime(0);
        sessionStartRef.current = null;
      }, 400);
    } else {
      setTimerOrbState('idle');
      setTimerElapsedTime(0);
      sessionStartRef.current = null;
    }
  }, [timerOrbState]);

  // Timer complete handler - saves session to database
  const handleTimerComplete = useCallback(async (showToast?: (toast: { type: 'success' | 'info'; title: string; message?: string }) => void) => {
    const duration = timerElapsedTime;
    const isValidSession = duration >= 60;
    const startTime = sessionStartRef.current || new Date(Date.now() - duration * 1000);
    const endTime = new Date();

    const finishTimer = () => {
      if (timerOrbState === 'running') {
        setTimerOrbState('dissolving');
        setTimeout(() => {
          setTimerOrbState('idle');
          setTimerElapsedTime(0);
          sessionStartRef.current = null;
        }, 400);
      } else {
        setTimerElapsedTime(0);
        sessionStartRef.current = null;
      }
    };

    if (isValidSession && user) {
      try {
        await createSession({
          durationSeconds: duration,
          startedAt: startTime.toISOString(),
          endedAt: endTime.toISOString(),
        });

        // Check for new achievements
        try {
          const newAchievements = await checkAndUnlockAchievements(user.id);
          if (newAchievements.length > 0 && showToast) {
            showToast({
              type: 'success',
              title: 'Achievement Unlocked!',
              message: `You earned: ${newAchievements.map(a => a.achievementType).join(', ')}`,
            });
          }
        } catch (e) {
          console.error('Failed to check achievements:', e);
        }

        if (showToast) {
          const mins = Math.floor(duration / 60);
          const secs = duration % 60;
          showToast({
            type: 'success',
            title: 'Session Saved',
            message: `Great focus! ${mins}m ${secs}s recorded.`,
          });
        }
      } catch (error) {
        console.error('Failed to save session:', error);
        if (showToast) {
          showToast({
            type: 'info',
            title: 'Save Failed',
            message: 'Could not save session. Please try again.',
          });
        }
      }
    } else if (!isValidSession && showToast) {
      showToast({
        type: 'info',
        title: 'Session Discarded',
        message: 'Sessions under 1 minute are not recorded.',
      });
    }

    finishTimer();
  }, [timerOrbState, timerElapsedTime, user, createSession]);

  // Handle user creation
  const handleCreateUser = async (name: string) => {
    try {
      await createUser({ name });
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  // Filter tasks for selected date
  const tasksForSelectedDate = tasks.filter(task => {
    const taskDate = task.date;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const selected = `${year}-${month}-${day}`;
    return taskDate === selected;
  });

  // Get calendar events from all tasks
  const calendarEvents = tasks.map(task => ({
    date: task.date,
    color: categoryDotColors[task.category],
  }));

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed' | 'userId' | 'createdAt'>) => {
    try {
      await createTask({
        title: taskData.title,
        category: taskData.category,
        date: taskData.date,
        startTime: taskData.startTime,
        endTime: taskData.endTime,
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(taskId);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleUpdateUser = async (updates: Partial<{ name: string; email: string; isPremium: boolean }>) => {
    try {
      await updateUser(updates);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Show loading state during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-sky-50">
        <div className="animate-pulse text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  // Show onboarding if no user exists
  if (!user) {
    return <OnboardingScreen onCreateUser={handleCreateUser} isLoading={userLoading} />;
  }

  // Calculate stats for display
  const todayMinutes = Math.round(getTodayFocusSeconds() / 60);
  const weekData = getWeekData();
  const currentStreak = userStats?.currentStreak ?? 0;
  const longestStreak = userStats?.longestStreak ?? 0;
  const averageMinutes = userStats && userStats.totalSessions > 0
    ? Math.round((userStats.totalFocusTime / 60) / userStats.totalSessions)
    : 0;

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return (
          <HomePage
            userName={user.name.split(' ')[0]}
            userAvatar={user.avatarPath}
            todayMinutes={todayMinutes}
            weekData={weekData}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            averageMinutes={averageMinutes}
          />
        );

      case Tab.STATS:
        return <StatsPage />;

      case Tab.FOCUS:
        return (
          <FocusTimer
            todayFocusTime={getTodayFocusSeconds()}
            orbState={timerOrbState}
            elapsedTime={timerElapsedTime}
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onReset={handleTimerReset}
            onComplete={handleTimerComplete}
          />
        );

      case Tab.USER:
        // Handle sub-pages within User tab
        if (subPage === 'achievements') {
          return (
            <AchievementsPage
              onBack={() => setSubPage(null)}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              totalFocusTime={userStats?.totalFocusTime ? Math.round(userStats.totalFocusTime / 60) : 0}
              totalSessions={userStats?.totalSessions ?? 0}
              tasksCompleted={userStats?.tasksCompleted ?? 0}
            />
          );
        }
        if (subPage === 'settings') {
          return <SettingsPage onBack={() => setSubPage(null)} />;
        }
        if (subPage === 'premium') {
          return (
            <PremiumPage
              onBack={() => setSubPage(null)}
              isPremium={user.isPremium}
              onUpgrade={async () => {
                await handleUpdateUser({ isPremium: true });
                setSubPage(null);
                setShowPremiumModal(true);
              }}
            />
          );
        }
        return (
          <UserProfile
            user={{
              id: user.id,
              name: user.name,
              email: user.email || '',
              avatar: user.avatarPath,
              joinDate: user.joinDate,
              isPremium: user.isPremium,
            }}
            stats={{
              totalFocusTime: userStats?.totalFocusTime ? Math.round(userStats.totalFocusTime / 60) : 0,
              totalSessions: userStats?.totalSessions ?? 0,
              currentStreak: currentStreak,
              longestStreak: longestStreak,
              tasksCompleted: userStats?.tasksCompleted ?? 0,
            }}
            onUpdateUser={(updates) => handleUpdateUser({
              name: updates.name,
              email: updates.email,
              isPremium: updates.isPremium,
            })}
            onLogout={handleLogout}
            onNavigate={(page) => setSubPage(page)}
          />
        );

      case Tab.SCHEDULE:
        return (
          <div className="animate-fade-in">
            <Calendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              events={calendarEvents}
            />
            <TaskList
              tasks={tasksForSelectedDate.map(t => ({
                id: t.id,
                title: t.title,
                category: t.category,
                date: t.date,
                startTime: t.startTime,
                endTime: t.endTime,
                completed: t.completed,
              }))}
              onAddTask={() => setIsAddTaskOpen(true)}
              onToggleTask={handleToggleTask}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Dynamic background based on active tab
  const getBackground = () => {
    if (activeTab === Tab.FOCUS) {
      return `
        radial-gradient(ellipse 90% 70% at 50% 0%, rgba(139, 92, 246, 0.18), transparent),
        radial-gradient(ellipse 70% 60% at 100% 30%, rgba(56, 189, 248, 0.15), transparent),
        radial-gradient(ellipse 60% 50% at 0% 70%, rgba(249, 168, 212, 0.14), transparent),
        radial-gradient(ellipse 50% 60% at 80% 100%, rgba(167, 139, 250, 0.12), transparent),
        linear-gradient(180deg, #f5f3ff 0%, #f0f9ff 50%, #fdf4ff 100%)
      `;
    }
    return `
      radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent),
      radial-gradient(ellipse 60% 40% at 100% 0%, rgba(249, 168, 212, 0.12), transparent),
      radial-gradient(ellipse 50% 50% at 0% 100%, rgba(56, 189, 248, 0.10), transparent),
      radial-gradient(ellipse 40% 40% at 80% 80%, rgba(167, 139, 250, 0.08), transparent),
      #F8FAFC
    `;
  };

  return (
    <div
      className="min-h-screen text-slate-900 selection:bg-violet-500 selection:text-white relative transition-all duration-700"
      style={{ background: getBackground() }}
    >

      <main className="
        container mx-auto px-5 py-6 pb-32 
        md:pl-32 md:pr-8 md:py-10 md:pb-10
        max-w-md md:max-w-xl
      ">
        {renderContent()}
      </main>

      {/* Navigation Dock */}
      <Dock activeTab={activeTab} setActiveTab={setActiveTab} isTimerRunning={isTimerRunning} />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSave={handleAddTask}
        selectedDate={selectedDate}
      />

      {/* Premium Success Modal */}
      <PremiumSuccessModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />
    </div>
  );
};

// Wrapper component to provide toast context
const AppWithProviders: React.FC = () => (
  <ToastProvider>
    <App />
  </ToastProvider>
);

export default AppWithProviders;