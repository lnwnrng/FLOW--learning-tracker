import { create } from 'zustand';
import type { User, CreateUserRequest, UpdateUserRequest } from '../types';
import * as userService from '../services/userService';

interface UserState {
    user: User | null;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    fetchUser: () => Promise<void>;
    createUser: (request: CreateUserRequest) => Promise<void>;
    updateUser: (request: UpdateUserRequest) => Promise<void>;
    setUser: (user: User | null) => void;
    rememberUser: (userId: string) => Promise<void>;
    signOut: () => Promise<void>;
    clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });
        try {
            const user = await userService.getUser();
            set({ user, isInitialized: true, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false,
                isInitialized: true
            });
        }
    },

    fetchUser: async () => {
        set({ isLoading: true, error: null });
        try {
            const user = await userService.getUser();
            set({ user, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
        }
    },

    createUser: async (request: CreateUserRequest) => {
        set({ isLoading: true, error: null });
        try {
            const user = await userService.createUser(request);
            set({ user, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
            throw error;
        }
    },

    updateUser: async (request: UpdateUserRequest) => {
        const { user } = get();
        if (!user) {
            set({ error: 'No user found' });
            return;
        }

        set({ isLoading: true, error: null });
        try {
            const updatedUser = await userService.updateUser(user.id, request);
            set({ user: updatedUser, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
            throw error;
        }
    },

    setUser: (user: User | null) => {
        set({ user, isInitialized: true, isLoading: false, error: null });
    },

    rememberUser: async (userId: string) => {
        try {
            await userService.setCurrentUser(userId);
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
        }
    },

    signOut: async () => {
        try {
            await userService.clearCurrentUser();
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
        } finally {
            // Clear user state without deleting user data
            // This allows the user to return to onboarding and sign back in
            set({ user: null, isInitialized: true, isLoading: false, error: null });
        }
    },

    clearError: () => set({ error: null }),
}));
