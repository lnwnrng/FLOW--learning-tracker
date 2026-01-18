import { invoke } from '@tauri-apps/api/core';
import type { Achievement, AchievementInfo, AchievementType } from '../types';

/**
 * Get all achievements for a user (including locked ones)
 */
export async function getAchievements(userId: string): Promise<AchievementInfo[]> {
    return await invoke<AchievementInfo[]>('get_achievements', { userId });
}

/**
 * Get count of achievements not yet viewed
 */
export async function getUnseenAchievementsCount(userId: string): Promise<number> {
    return await invoke<number>('get_unseen_achievements_count', { userId });
}

/**
 * Mark achievements as viewed
 */
export async function markAchievementsSeen(userId: string): Promise<void> {
    return await invoke<void>('mark_achievements_seen', { userId });
}

/**
 * Unlock a specific achievement
 */
export async function unlockAchievement(
    userId: string,
    achievementType: AchievementType
): Promise<Achievement> {
    return await invoke<Achievement>('unlock_achievement', { userId, achievementType });
}

/**
 * Check and unlock achievements based on current user stats
 * Returns newly unlocked achievements
 */
export async function checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    return await invoke<Achievement[]>('check_and_unlock_achievements', { userId });
}
