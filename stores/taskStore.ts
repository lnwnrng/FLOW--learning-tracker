import { create } from 'zustand';
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskCategory } from '../types';
import * as taskService from '../services/taskService';
import { useUserStore } from './userStore';

interface TaskState {
    tasks: Task[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchTasks: (date?: string) => Promise<void>;
    fetchAllTasks: () => Promise<void>;
    createTask: (request: Omit<CreateTaskRequest, 'userId'>) => Promise<Task>;
    updateTask: (taskId: string, request: UpdateTaskRequest) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    toggleTask: (taskId: string) => Promise<void>;
    getTasksForDate: (date: string) => Task[];
    clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchTasks: async (date?: string) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
            const tasks = await taskService.getTasks(user.id, date);
            if (date) {
                // Merge with existing tasks, replacing those for this date
                set(state => ({
                    tasks: [
                        ...state.tasks.filter(t => t.date !== date),
                        ...tasks
                    ],
                    isLoading: false,
                }));
            } else {
                set({ tasks, isLoading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
        }
    },

    fetchAllTasks: async () => {
        const user = useUserStore.getState().user;
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
            const tasks = await taskService.getTasks(user.id);
            set({ tasks, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
        }
    },

    createTask: async (request) => {
        const user = useUserStore.getState().user;
        if (!user) {
            throw new Error('No user found');
        }

        set({ isLoading: true, error: null });
        try {
            const task = await taskService.createTask({
                ...request,
                userId: user.id,
            });
            set(state => ({
                tasks: [...state.tasks, task],
                isLoading: false
            }));
            return task;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
            throw error;
        }
    },

    updateTask: async (taskId: string, request: UpdateTaskRequest) => {
        set({ isLoading: true, error: null });
        try {
            const updatedTask = await taskService.updateTask(taskId, request);
            set(state => ({
                tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
            throw error;
        }
    },

    deleteTask: async (taskId: string) => {
        set({ isLoading: true, error: null });
        try {
            await taskService.deleteTask(taskId);
            set(state => ({
                tasks: state.tasks.filter(t => t.id !== taskId),
                isLoading: false,
            }));
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : String(error),
                isLoading: false
            });
            throw error;
        }
    },

    toggleTask: async (taskId: string) => {
        try {
            const updatedTask = await taskService.toggleTaskCompletion(taskId);
            set(state => ({
                tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
            }));
        } catch (error) {
            set({ error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    },

    getTasksForDate: (date: string) => {
        return get().tasks.filter(t => t.date === date);
    },

    clearError: () => set({ error: null }),
}));
