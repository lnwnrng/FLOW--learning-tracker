export enum Tab {
  HOME = 'home',
  STATS = 'stats',
  FOCUS = 'focus',
  USER = 'user',
  SCHEDULE = 'schedule'
}

// ============ User Types ============

export interface User {
  id: string;
  name: string;
  email: string | null;
  avatarPath: string | null;
  joinDate: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatarPath?: string;
  isPremium?: boolean;
}

// ============ Task Types ============

export type TaskCategory = 'To Do' | 'Event' | 'Reminder';

export interface Task {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format (24h)
  endTime: string; // HH:MM format (24h)
  completed: boolean;
  createdAt: string;
}

export interface CreateTaskRequest {
  userId: string;
  title: string;
  category: TaskCategory;
  date: string;
  startTime: string;
  endTime: string;
}

export interface UpdateTaskRequest {
  title?: string;
  category?: TaskCategory;
  date?: string;
  startTime?: string;
  endTime?: string;
  completed?: boolean;
}

// ============ Session Types ============

export interface FocusSession {
  id: string;
  userId: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  category: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CreateFocusSessionRequest {
  userId: string;
  durationSeconds: number;
  startedAt: string;
  endedAt: string;
  category?: string;
  notes?: string;
}

export interface DailyStats {
  date: string;
  totalFocusSeconds: number;
  sessionCount: number;
}

export interface HeatmapData {
  date: string;
  value: number; // focus time in minutes
}

export interface UserStats {
  totalFocusTime: number; // in seconds
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  tasksCompleted: number;
}

// ============ Achievement Types ============

export type AchievementType =
  | 'first_session'
  | 'hour_master'
  | 'streak_week'
  | 'streak_month'
  | 'total_hours_10'
  | 'total_hours_50'
  | 'total_hours_100'
  | 'early_bird'
  | 'night_owl'
  | 'task_master';

export interface Achievement {
  id: string;
  userId: string;
  achievementType: AchievementType;
  unlockedAt: string;
  metadata: string | null;
}

export interface AchievementInfo {
  achievementType: AchievementType;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

// ============ Data Export Types ============

export interface ExportData {
  exportedAt: string;
  user: User | null;
  focusSessions: FocusSession[];
  tasks: Task[];
  achievements: Achievement[];
  settings: Record<string, string>;
  dailyStats: DailyStats[];
}

export interface ImportResult {
  success: boolean;
  usersImported: number;
  sessionsImported: number;
  tasksImported: number;
  achievementsImported: number;
  settingsImported: number;
  errors: string[];
}

// ============ Calendar Types ============

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  hasEvent: boolean;
  isSelected?: boolean;
}

export interface CalendarEvent {
  date: string; // YYYY-MM-DD format
  color: string;
}