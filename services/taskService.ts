import { invoke } from '@tauri-apps/api/core';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types';

/**
 * Create a new task
 */
export async function createTask(request: CreateTaskRequest): Promise<Task> {
    return await invoke<Task>('create_task', { request });
}

/**
 * Get tasks for a user, optionally filtered by date
 */
export async function getTasks(userId: string, date?: string): Promise<Task[]> {
    return await invoke<Task[]>('get_tasks', { userId, date });
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, request: UpdateTaskRequest): Promise<Task> {
    return await invoke<Task>('update_task', { taskId, request });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
    return await invoke<void>('delete_task', { taskId });
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: string): Promise<Task> {
    return await invoke<Task>('toggle_task_completion', { taskId });
}
