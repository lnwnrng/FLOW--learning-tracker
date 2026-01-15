export enum Tab {
  HOME = 'home',
  STATS = 'stats',
  FOCUS = 'focus',
  USER = 'user',
  SCHEDULE = 'schedule'
}

export interface Task {
  id: string;
  title: string;
  category: 'To Do' | 'Event' | 'Reminder';
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format (24h)
  endTime: string; // HH:MM format (24h)
  completed: boolean;
}

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
  isSelected?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  joinDate: string;
  isPremium: boolean;
}

export interface UserStats {
  totalFocusTime: number; // in minutes
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
}