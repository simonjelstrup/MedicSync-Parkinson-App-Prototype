import React, { createContext, useContext } from 'react';
import { useTodayStore } from '../stores/todayStore';

type SilenceContextType = {
  silenced: Record<string, boolean>;
  toggleSilence: (doseId: string) => void;
  isSilenced: (doseId: string) => boolean;
};

const SilenceContext = createContext<SilenceContextType>({
  silenced: {},
  toggleSilence: () => undefined,
  isSilenced: () => false,
});

export function SilenceProvider({ children }: { children: React.ReactNode }) {
  const silenced = useTodayStore((s) => s.silenced);
  const toggleSilence = useTodayStore((s) => s.toggleSilence);

  const isSilenced = (doseId: string) => !!silenced[doseId];

  return (
    <SilenceContext.Provider value={{ silenced, toggleSilence, isSilenced }}>
      {children}
    </SilenceContext.Provider>
  );
}

export function useSilence() {
  return useContext(SilenceContext);
}
