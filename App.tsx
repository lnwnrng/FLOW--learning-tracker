import React, { useState } from 'react';
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
            todayFocusTime={3600} // Mock: 1 hour
            onSessionComplete={(duration, taskId) => {
              console.log('Session completed:', duration, 'seconds, task:', taskId);
              // TODO: Save to heatmap data
            }}
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

  return (
    <div
      className="min-h-screen text-slate-900 selection:bg-violet-500 selection:text-white relative"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), transparent),
          radial-gradient(ellipse 60% 40% at 100% 0%, rgba(249, 168, 212, 0.12), transparent),
          radial-gradient(ellipse 50% 50% at 0% 100%, rgba(56, 189, 248, 0.10), transparent),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(167, 139, 250, 0.08), transparent),
          #F8FAFC
        `
      }}
    >

      <main className="
        container mx-auto px-5 py-6 pb-32 
        md:pl-32 md:pr-8 md:py-10 md:pb-10
        max-w-md md:max-w-xl
      ">
        {renderContent()}
      </main>

      {/* Navigation Dock */}
      <Dock activeTab={activeTab} setActiveTab={setActiveTab} />

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