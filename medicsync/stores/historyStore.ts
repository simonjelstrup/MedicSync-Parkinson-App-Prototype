import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DoseLog } from '../lib/mockData';
import { mockHistory } from '../lib/mockData';

type HistoryState = {
  logs: DoseLog[];
  logDose: (log: DoseLog) => void;
  updateLog: (id: string, changes: Partial<DoseLog>) => void;
  clearHistory: () => void;
};

// Seed store with mock history so the app has realistic data from first launch
const seedLogs: DoseLog[] = mockHistory.flatMap((day) => day.logs);

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      logs: seedLogs,

      logDose: (log) =>
        set((state) => ({
          logs: [
            log,
            ...state.logs.filter(
              (l) => l.id !== log.id && !(l.doseId === log.doseId && l.date === log.date)
            ),
          ],
        })),

      updateLog: (id, changes) =>
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...changes } : l)),
        })),

      clearHistory: () => set({ logs: [] }),
    }),
    {
      name: 'medicsync-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
