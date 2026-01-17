import { create } from 'zustand';
import * as settingsService from '../services/settingsService';
import { useUserStore } from './userStore';

interface SettingsState {
    settings: Record<string, string>;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchSettings: () => Promise<void>;
    getSetting: (key: string) => string | undefined;
    setSetting: (key: string, value: string) => Promise<void>;
    deleteSetting: (key: string) => Promise<void>;
    clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: {},
    isLoading: false,
    error: null,

    fetchSettings: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
            const settings = await settingsService.getAllSettings(user.id);
            set({ settings, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
        }
    },

    getSetting: (key: string) => {
        return get().settings[key];
    },

    setSetting: async (key: string, value: string) => {
        const user = useUserStore.getState().user;
        if (!user) {
            throw new Error('No user found');
        }

        try {
            await settingsService.setSetting(user.id, key, value);
            set(state => ({
                settings: { ...state.settings, [key]: value },
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    },

    deleteSetting: async (key: string) => {
        const user = useUserStore.getState().user;
        if (!user) {
            throw new Error('No user found');
        }

        try {
            await settingsService.deleteSetting(user.id, key);
            set(state => {
                const { [key]: _, ...rest } = state.settings;
                return { settings: rest };
            });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
