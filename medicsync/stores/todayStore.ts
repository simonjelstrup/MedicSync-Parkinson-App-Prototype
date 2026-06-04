import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type MealAdjustment = {
  shiftMinutes?: number;
  customTime?: string;
};

type TodayState = {
  date: string;
  mealAdjustments: Record<string, MealAdjustment>;
  silenced: Record<string, boolean>;
  activeProfile: 'home' | 'outdoors';

  checkRollover: () => void;
  setMealAdjustment: (meal: string, adj: MealAdjustment | null) => void;
  toggleSilence: (doseId: string) => void;
  setActiveProfile: (profile: 'home' | 'outdoors') => void;
};

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useTodayStore = create<TodayState>()(
  persist(
    (set, get) => ({
      date: todayString(),
      mealAdjustments: {},
      silenced: {},
      activeProfile: 'home',

      checkRollover: () => {
        const today = todayString();
        if (get().date !== today) {
          set({ date: today, mealAdjustments: {}, silenced: {} });
        }
      },

      setMealAdjustment: (meal, adj) =>
        set((state) => {
          if (adj === null) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [meal]: _removed, ...rest } = state.mealAdjustments;
            return { mealAdjustments: rest };
          }
          return { mealAdjustments: { ...state.mealAdjustments, [meal]: adj } };
        }),

      toggleSilence: (doseId) =>
        set((state) => ({
          silenced: { ...state.silenced, [doseId]: !state.silenced[doseId] },
        })),

      setActiveProfile: (profile) => set({ activeProfile: profile }),
    }),
    {
      name: 'medicsync-today',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const today = todayString();
          if (state.date !== today) {
            state.date = today;
            state.mealAdjustments = {};
            state.silenced = {};
          }
        }
      },
    }
  )
);
