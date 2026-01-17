import { invoke } from '@tauri-apps/api/core';
import type {
    FocusSession,
    CreateFocusSessionRequest,
    DailyStats,
    HeatmapData,
    UserStats
} from '../types';

/**
 * Create a new focus session
 */
export async function createFocusSession(request: CreateFocusSessionRequest): Promise<FocusSession> {
    return await invoke<FocusSession>('create_focus_session', { request });
}

/**
 * Get focus sessions for a user
 */
export async function getFocusSessions(userId: string, limit?: number): Promise<FocusSession[]> {
    return await invoke<FocusSession[]>('get_focus_sessions', { userId, limit });
}

/**
 * Get daily stats for a date range
 */
export async function getDailyStats(
    userId: string,
    startDate: string,
    endDate: string
): Promise<DailyStats[]> {
    return await invoke<DailyStats[]>('get_daily_stats', { userId, startDate, endDate });
}

/**
 * Get heatmap data for the past year
 */
export async function getHeatmapData(userId: string): Promise<HeatmapData[]> {
    return await invoke<HeatmapData[]>('get_heatmap_data', { userId });
}

/**
 * Get user statistics summary
 */
export async function getUserStats(userId: string): Promise<UserStats> {
    return await invoke<UserStats>('get_user_stats', { userId });
}
