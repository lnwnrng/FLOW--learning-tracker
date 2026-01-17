import { invoke } from '@tauri-apps/api/core';
import type { ExportData, ImportResult } from '../types';

/**
 * Export all user data as JSON
 */
export async function exportAllData(userId: string): Promise<ExportData> {
    return await invoke<ExportData>('export_all_data', { userId });
}

/**
 * Import data from JSON
 */
export async function importData(data: ExportData): Promise<ImportResult> {
    return await invoke<ImportResult>('import_data', { data });
}
