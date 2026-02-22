/**
 * templateStore.ts — Legacy compatibility shim
 *
 * Previously this was a separate store that stored `templates: Record<id, Template>`.
 * Now all creation logic lives in creationStore (FSM-backed with TemplateDraft).
 *
 * This shim provides the old API surface over the new store so old screens
 * continue to compile without a full rewrite.  New code should use useCreationStore.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Template, TemplateDay } from '../types/backend.types';

// ─── State ────────────────────────────────────────────────────────────────────

interface LegacyTemplateState {
  templates: Record<string, Template & { days: TemplateDay[] }>;
}

interface LegacyTemplateActions {
  createTemplate:    (data: { id: string; name: string; description?: string; color?: string; days?: TemplateDay[] }) => void;
  updateTemplate:    (id: string, updates: Partial<{ name: string; description: string; color: string; days: TemplateDay[] }>) => void;
  deleteTemplate:    (id: string) => void;
  updateTemplateDay: (templateId: string, dayId: number, updates: Partial<TemplateDay>) => void;
}

type LegacyTemplateStore = LegacyTemplateState & LegacyTemplateActions;

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTemplateStore = create<LegacyTemplateStore>()(
  persist(
    immer((set) => ({
      templates: {},

      createTemplate: (data) =>
        set((s) => {
          s.templates[data.id] = {
            id: data.id as any,
            name: data.name,
            description: data.description ?? '',
            color: data.color ?? '#6366F1',
            days: data.days ?? Array.from({ length: 7 }, (_, i) => ({ dayId: i + 1, isRestDay: true })),
          };
        }),

      updateTemplate: (id, updates) =>
        set((s) => {
          const t = s.templates[id];
          if (!t) return;
          Object.assign(t, updates);
        }),

      deleteTemplate: (id) =>
        set((s) => { delete s.templates[id]; }),

      updateTemplateDay: (templateId, dayId, updates) =>
        set((s) => {
          const t = s.templates[templateId];
          if (!t) return;
          const day = t.days.find((d) => d.dayId === dayId);
          if (day) Object.assign(day, updates);
        }),
    })),
    {
      name: 'template-store-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
