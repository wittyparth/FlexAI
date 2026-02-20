import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Template, TemplateDay } from '../types/backend.types';

interface TemplateState {
    templates: Record<string, Template>;
}

interface TemplateActions {
    createTemplate: (template: Template) => void;
    updateTemplate: (id: string, updates: Partial<Template>) => void;
    deleteTemplate: (id: string) => void;
    updateTemplateDay: (templateId: string, dayId: number, dayUpdates: Partial<TemplateDay>) => void;
}

const generateDefaultDays = (): TemplateDay[] => {
    return Array.from({ length: 7 }, (_, i) => ({
        dayId: i + 1,
        isRestDay: true,
    }));
};

const INITIAL_MOCK_TEMPLATES: Record<string, Template> = {
    't1': {
        id: 't1',
        name: 'Quick Push (30 min)',
        description: 'A fast push workout when short on time.',
        color: '#F59E0B',
        exercises: 5,
        lastUsed: '2 days ago',
        createdAt: new Date().toISOString(),
        days: generateDefaultDays().map(d => d.dayId === 1 ? { ...d, isRestDay: false, routineId: 1 } : d),
    },
    't2': {
        id: 't2',
        name: 'Chest & Triceps',
        description: 'Heavy chest focus with tricep isolation.',
        color: '#EC4899',
        exercises: 7,
        lastUsed: 'Last week',
        createdAt: new Date().toISOString(),
        days: generateDefaultDays().map(d => d.dayId === 2 ? { ...d, isRestDay: false, routineId: 1 } : d),
    },
    't3': {
        id: 't3',
        name: 'Back & Biceps',
        description: 'Pull day focusing on width and thickness.',
        color: '#8B5CF6',
        exercises: 6,
        lastUsed: '10 days ago',
        createdAt: new Date().toISOString(),
        days: generateDefaultDays().map(d => d.dayId === 3 ? { ...d, isRestDay: false, routineId: 2 } : d),
    },
};

const initialState: TemplateState = {
    templates: INITIAL_MOCK_TEMPLATES,
};

export const useTemplateStore = create<TemplateState & TemplateActions>()(
    persist(
        immer((set, get) => ({
            ...initialState,

            createTemplate: (template) => {
                set((state) => {
                    const id = template.id || `t_${Date.now()}`;
                    state.templates[id] = { ...template, id, days: template.days?.length ? template.days : generateDefaultDays() };
                });
            },

            updateTemplate: (id, updates) => {
                set((state) => {
                    if (state.templates[id]) {
                        Object.assign(state.templates[id], updates);
                    }
                });
            },

            deleteTemplate: (id) => {
                set((state) => {
                    delete state.templates[id];
                });
            },

            updateTemplateDay: (templateId, dayId, dayUpdates) => {
                set((state) => {
                    const template = state.templates[templateId];
                    if (template) {
                        const dayIndex = template.days.findIndex(d => d.dayId === dayId);
                        if (dayIndex !== -1) {
                            template.days[dayIndex] = { ...template.days[dayIndex], ...dayUpdates };
                        }
                    }
                });
            },
        })),
        {
            name: 'template-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
