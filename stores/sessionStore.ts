import { create } from 'zustand';
import type {
    FocusSession,
    CreateFocusSessionRequest,
    DailyStats,
    HeatmapData,
    UserStats
} from '../types';
import * as sessionService from '../services/sessionService';
import { useUserStore } from './userStore';

interface SessionState {
    sessions: FocusSession[];
    dailyStats: DailyStats[];
    userStats: UserStats | null;
    heatmapData: HeatmapData[];
    isLoading: boolean;
    error: string | null;

    // Actions
    createSession: (request: Omit<CreateFocusSessionRequest, 'userId'>) => Promise<FocusSession>;
    fetchSessions: (limit?: number) => Promise<void>;
    fetchDailyStats: (startDate: string, endDate: string) => Promise<void>;
    fetchUserStats: () => Promise<void>;
    fetchHeatmapData: () => Promise<void>;
    getTodayFocusSeconds: () => number;
    getTodaySessionCount: () => number;
    getWeekData: () => number[];
    clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
    sessions: [],
    dailyStats: [],
    userStats: null,
    heatmapData: [],
    isLoading: false,
    error: null,

    createSession: async (request) => {
        const user = useUserStore.getState().user;
        if (!user) {
            throw new Error('No user found');
        }

        set({ isLoading: true, error: null });
        try {
            const session = await sessionService.createFocusSession({
                ...request,
                userId: user.id,
            });
            set(state => ({
                sessions: [session, ...state.sessions],
                isLoading: false
            }));

            // Refresh stats after creating session
            get().fetchUserStats();
            get().fetchDailyStats(
                getDateDaysAgo(7),
                getTodayDate()
            );
            get().fetchHeatmapData();

            return session;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
            throw error;
        }
    },

    fetchSessions: async (limit?: number) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
            const sessions = await sessionService.getFocusSessions(user.id, limit);
            set({ sessions, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
        }
    },

    fetchDailyStats: async (startDate: string, endDate: string) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
            const dailyStats = await sessionService.getDailyStats(user.id, startDate, endDate);
            set({ dailyStats });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
        }
    },

    fetchUserStats: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
            const userStats = await sessionService.getUserStats(user.id);
            set({ userStats });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
        }
    },

    fetchHeatmapData: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        try {
            const heatmapData = await sessionService.getHeatmapData(user.id);
            set({ heatmapData });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
        }
    },

    getTodayFocusSeconds: () => {
        const { dailyStats } = get();
        const today = getTodayDate();
        const todayStats = dailyStats.find(s => s.date === today);
        return todayStats?.totalFocusSeconds ?? 0;
    },

    getTodaySessionCount: () => {
        const { dailyStats } = get();
        const today = getTodayDate();
        const todayStats = dailyStats.find(s => s.date === today);
        return todayStats?.sessionCount ?? 0;
    },

    getWeekData: () => {
        const { dailyStats } = get();
        const result: number[] = [];
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateKey = formatLocalDate(date);
            const stat = dailyStats.find(s => s.date === dateKey);
            result.push(stat ? Math.round(stat.totalFocusSeconds / 60) : 0);
        }

        return result;
    },

    clearError: () => set({ error: null }),
}));

// Helper functions
function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayDate(): string {
    return formatLocalDate(new Date());
}

function getDateDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return formatLocalDate(date);
}
