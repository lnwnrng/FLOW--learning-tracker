import { invoke } from '@tauri-apps/api/core';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';

/**
 * Get the current user (singleton for offline app)
 */
export async function getUser(): Promise<User | null> {
    return await invoke<User | null>('get_user');
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
    return await invoke<User[]>('get_users');
}

/**
 * Create a new user
 */
export async function createUser(request: CreateUserRequest): Promise<User> {
    return await invoke<User>('create_user', { request });
}

/**
 * Update user information
 */
export async function updateUser(userId: string, request: UpdateUserRequest): Promise<User> {
    return await invoke<User>('update_user', { userId, request });
}
