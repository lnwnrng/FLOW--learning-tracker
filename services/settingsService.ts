import { invoke } from '@tauri-apps/api/core';

/**
 * Get a single setting value
 */
export async function getSetting(userId: string, key: string): Promise<string | null> {
    return await invoke<string | null>('get_setting', { userId, key });
}

/**
 * Set a setting value
 */
export async function setSetting(userId: string, key: string, value: string): Promise<void> {
    return await invoke<void>('set_setting', { userId, key, value });
}

/**
 * Get all settings for a user
 */
export async function getAllSettings(userId: string): Promise<Record<string, string>> {
    return await invoke<Record<string, string>>('get_all_settings', { userId });
}

/**
 * Delete a setting
 */
export async function deleteSetting(userId: string, key: string): Promise<void> {
    return await invoke<void>('delete_setting', { userId, key });
}
