import { invoke } from '@tauri-apps/api/core';
import type { Achievement, AchievementInfo, AchievementType } from '../types';

/**
 * Get all achievements for a user (including locked ones)
 */
export async function getAchievements(userId: string): Promise<AchievementInfo[]> {
    return await invoke<AchievementInfo[]>('get_achievements', { userId });
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
