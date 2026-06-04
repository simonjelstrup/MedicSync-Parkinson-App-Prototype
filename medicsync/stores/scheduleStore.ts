import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Medication } from '../lib/mockData';

export type MealAnchor = {
  meal: 'breakfast' | 'lunch' | 'dinner';
  relation: 'before' | 'after';
  minutes: number;
};

// Stored without scheduledTime — that's always computed from mealAnchor + mealTimes (or fixedTime)
export type StoredDose = {
  id: string;
  label: string;
  timingMode: 'meal' | 'fixed';
  fixedTime: string;
  mealAnchor: MealAnchor;
  medications: Medication[];
};

type ScheduleState = {
  doses: StoredDose[];
  addDose: (dose: StoredDose) => void;
  updateDose: (id: string, changes: Partial<Omit<StoredDose, 'id'>>) => void;
  deleteDose: (id: string) => void;
};

const defaultDoses: StoredDose[] = [
  {
    id: 'morning',
    label: 'Morning',
    timingMode: 'meal',
    fixedTime: '08:00',
    mealAnchor: { meal: 'breakfast', relation: 'before', minutes: 30 },
    medications: [
      { id: 'm1', name: 'Levodopa', dosage: '100mg' },
      { id: 'm2', name: 'Amantadine', dosage: '100mg' },
    ],
  },
  {
    id: 'lunch',
    label: 'Lunch',
    timingMode: 'meal',
    fixedTime: '12:00',
    mealAnchor: { meal: 'lunch', relation: 'before', minutes: 30 },
    medications: [
      { id: 'm1', name: 'Levodopa', dosage: '100mg' },
      { id: 'm2', name: 'Amantadine', dosage: '100mg' },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    timingMode: 'meal',
    fixedTime: '16:00',
    mealAnchor: { meal: 'dinner', relation: 'before', minutes: 60 },
    medications: [{ id: 'm1', name: 'Levodopa', dosage: '100mg' }],
  },
  {
    id: 'night',
    label: 'Night',
    timingMode: 'meal',
    fixedTime: '20:00',
    mealAnchor: { meal: 'dinner', relation: 'after', minutes: 60 },
    medications: [{ id: 'm1', name: 'Levodopa', dosage: '100mg' }],
  },
];

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      doses: defaultDoses,
      addDose: (dose) => set((state) => ({ doses: [...state.doses, dose] })),
      updateDose: (id, changes) =>
        set((state) => ({
          doses: state.doses.map((d) => (d.id === id ? { ...d, ...changes } : d)),
        })),
      deleteDose: (id) =>
        set((state) => ({ doses: state.doses.filter((d) => d.id !== id) })),
    }),
    {
      name: 'medicsync-schedule',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
