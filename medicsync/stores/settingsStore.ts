import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AlarmSound = 'gentleChime' | 'softBells' | 'morningBirds' | 'windBells' | 'strongTone';
export type AlarmEscalation = 'slow' | 'medium' | 'fast';
export type AlarmPattern = 'constant' | 'intervals' | 'every30' | 'everyMin';

export type AlarmProfile = {
  id: 'home' | 'outdoors';
  sound: AlarmSound;
  escalation: AlarmEscalation;
  pattern: AlarmPattern;
};

export type MealTimes = { breakfast: string; lunch: string; dinner: string };

type SettingsState = {
  mealTimes: MealTimes;
  defaultMealRelation: 'before' | 'after';
  defaultMealMinutes: 30 | 60;
  profiles: { home: AlarmProfile; outdoors: AlarmProfile };
  relativesEnabled: boolean;
  relativesNotifyMissedAfterMin: 5 | 15 | 30 | 60;
  relativeContact: { name: string; method: string } | null;
  pillboxRadius: 50 | 100 | 200 | 500;

  setMealTime: (meal: keyof MealTimes, time: string) => void;
  setDefaultMealRelation: (relation: 'before' | 'after') => void;
  setDefaultMealMinutes: (minutes: 30 | 60) => void;
  setProfile: (id: 'home' | 'outdoors', profile: AlarmProfile) => void;
  setRelativesEnabled: (enabled: boolean) => void;
  setRelativeContact: (contact: { name: string; method: string } | null) => void;
  setRelativesNotifyMissedAfterMin: (min: 5 | 15 | 30 | 60) => void;
  setPillboxRadius: (radius: 50 | 100 | 200 | 500) => void;
};

const defaultHomeProfile: AlarmProfile = {
  id: 'home',
  sound: 'gentleChime',
  escalation: 'slow',
  pattern: 'constant',
};

const defaultOutdoorsProfile: AlarmProfile = {
  id: 'outdoors',
  sound: 'strongTone',
  escalation: 'fast',
  pattern: 'constant',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mealTimes: { breakfast: '07:30', lunch: '12:00', dinner: '18:00' },
      defaultMealRelation: 'before',
      defaultMealMinutes: 30,
      profiles: { home: defaultHomeProfile, outdoors: defaultOutdoorsProfile },
      relativesEnabled: true,
      relativesNotifyMissedAfterMin: 15,
      relativeContact: { name: 'Erik Andersen', method: 'app' },
      pillboxRadius: 100,

      setMealTime: (meal, time) =>
        set((state) => ({ mealTimes: { ...state.mealTimes, [meal]: time } })),
      setDefaultMealRelation: (relation) => set({ defaultMealRelation: relation }),
      setDefaultMealMinutes: (minutes) => set({ defaultMealMinutes: minutes }),
      setProfile: (id, profile) =>
        set((state) => ({ profiles: { ...state.profiles, [id]: profile } })),
      setRelativesEnabled: (enabled) => set({ relativesEnabled: enabled }),
      setRelativeContact: (contact) => set({ relativeContact: contact }),
      setRelativesNotifyMissedAfterMin: (min) => set({ relativesNotifyMissedAfterMin: min }),
      setPillboxRadius: (radius) => set({ pillboxRadius: radius }),
    }),
    {
      name: 'medicsync-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
