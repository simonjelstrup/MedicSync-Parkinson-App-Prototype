import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PillboxState = {
  paired: boolean;
  lastKnownLocation: { lat: number; lng: number; timestamp: string } | null;
  lastSeenAtHome: string | null;
  isCurrentlyAtHome: boolean;
};

type PillboxSettings = {
  leaveHomeAlertEnabled: boolean;
  alertRadiusMetres: 50 | 100 | 250 | 500;
  homeLocation: { lat: number; lng: number } | null;
};

type PillboxStoreState = {
  state: PillboxState;
  settings: PillboxSettings;
  setLeaveHomeAlertEnabled: (enabled: boolean) => void;
  setAlertRadius: (metres: 50 | 100 | 250 | 500) => void;
};

export const usePillboxStore = create<PillboxStoreState>()(
  persist(
    (set) => ({
      state: {
        paired: false,
        lastKnownLocation: null,
        lastSeenAtHome: new Date().toISOString(),
        isCurrentlyAtHome: true,
      },
      settings: {
        leaveHomeAlertEnabled: true,
        alertRadiusMetres: 100,
        homeLocation: null,
      },
      setLeaveHomeAlertEnabled: (enabled) =>
        set((s) => ({ settings: { ...s.settings, leaveHomeAlertEnabled: enabled } })),
      setAlertRadius: (metres) =>
        set((s) => ({ settings: { ...s.settings, alertRadiusMetres: metres } })),
    }),
    {
      name: 'medicsync-pillbox',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
