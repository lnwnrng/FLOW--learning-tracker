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
import { Tab, Task, User, UserStats } from './types';

// Category to color mapping for calendar dots
const categoryDotColors: Record<Task['category'], string> = {
  'Reminder': 'bg-sky-400',
  'To Do': 'bg-emerald-400',
  'Event': 'bg-violet-400',
};

// Default user data (logged in state)
const defaultUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  avatar: null,
  joinDate: '2024-06-15',
  isPremium: false,
};

// Mock stats
const defaultStats: UserStats = {
  totalFocusTime: 1250, // ~20 hours
  totalSessions: 48,
  currentStreak: 7,
  longestStreak: 14,
  tasksCompleted: 156,
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.HOME);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [user, setUser] = useState<User>(defaultUser);
  const [stats] = useState<UserStats>(defaultStats);
  const [subPage, setSubPage] = useState<'achievements' | 'settings' | 'premium' | null>(null);

  // Timer state - lifted from FocusTimer to persist across page navigation
  const [timerOrbState, setTimerOrbState] = useState<'idle' | 'forming' | 'running' | 'dissolving'>('idle');
  const [timerElapsedTime, setTimerElapsedTime] = useState(0);
  const [timerSelectedTaskId, setTimerSelectedTaskId] = useState<string | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const timerStartTimeRef = useRef<number | null>(null);

  const isTimerRunning = timerOrbState === 'running';

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
        setTimerSelectedTaskId(null);
      }, 400);
    } else {
      setTimerOrbState('idle');
      setTimerElapsedTime(0);
      setTimerSelectedTaskId(null);
    }
  }, [timerOrbState]);

  const handleTimerComplete = useCallback(() => {
    const duration = timerElapsedTime;
    const taskId = timerSelectedTaskId;
    if (timerOrbState === 'running') {
      setTimerOrbState('dissolving');
      setTimeout(() => {
        setTimerOrbState('idle');
        if (duration > 0) {
          console.log('Session completed:', duration, 'seconds, task:', taskId);
        }
        setTimerElapsedTime(0);
        setTimerSelectedTaskId(null);
      }, 400);
    } else {
      if (duration > 0) {
        console.log('Session completed:', duration, 'seconds, task:', taskId);
      }
      setTimerElapsedTime(0);
      setTimerSelectedTaskId(null);
    }
  }, [timerOrbState, timerElapsedTime, timerSelectedTaskId]);

  // Filter tasks for selected date
  const tasksForSelectedDate = tasks.filter(task => {
    const taskDate = task.date;
    const selected = selectedDate.toISOString().split('T')[0];
    return taskDate === selected;
  });

  // Get calendar events from tasks (for current month)
  const calendarEvents = tasks
    .filter(task => {
      const taskDate = new Date(task.date);
      return taskDate.getMonth() === selectedDate.getMonth() &&
        taskDate.getFullYear() === selectedDate.getFullYear();
    })
    .map(task => ({
      date: new Date(task.date).getDate(),
      color: categoryDotColors[task.category],
    }));

  const handleAddTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleUpdateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const handleLogout = () => {
    // TODO: Implement actual logout
    console.log('Logout clicked');
  };

  const renderContent = () => {
    switch (activeTab) {
      case Tab.HOME:
        return (
          <HomePage
            userName={user.name.split(' ')[0]}
            userAvatar={user.avatar}
            todayMinutes={165}
            weekData={[45, 120, 90, 0, 80, 165, 0]}
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            averageMinutes={Math.round(stats.totalFocusTime / stats.totalSessions)}
          />
        );

      case Tab.STATS:
        return <StatsPage />;

      case Tab.FOCUS:
        return (
          <FocusTimer
            tasks={tasksForSelectedDate}
            todayFocusTime={3600}
            orbState={timerOrbState}
            elapsedTime={timerElapsedTime}
            selectedTaskId={timerSelectedTaskId}
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onReset={handleTimerReset}
            onComplete={handleTimerComplete}
            onSelectTask={setTimerSelectedTaskId}
          />
        );

      case Tab.USER:
        // Handle sub-pages within User tab
        if (subPage === 'achievements') {
          return (
            <AchievementsPage
              onBack={() => setSubPage(null)}
              currentStreak={stats.currentStreak}
              longestStreak={stats.longestStreak}
              totalFocusTime={stats.totalFocusTime}
              totalSessions={stats.totalSessions}
              tasksCompleted={stats.tasksCompleted}
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
              onUpgrade={() => {
                setUser(prev => ({ ...prev, isPremium: true }));
                setSubPage(null);
              }}
            />
          );
        }
        return (
          <UserProfile
            user={user}
            stats={stats}
            onUpdateUser={handleUpdateUser}
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
              tasks={tasksForSelectedDate}
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
    </div>
  );
};

// Simple placeholder for other tabs
const Placeholder: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 text-3xl">
      🚧
    </div>
    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    <p className="text-slate-500 mt-2 font-medium">{subtitle} coming soon...</p>
  </div>
);

export default App;