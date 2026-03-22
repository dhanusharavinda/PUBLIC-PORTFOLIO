'use client';

import { createContext, useContext, type ReactNode } from 'react';

type Mode = 'aesthetic';

interface ModeContextType {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  isProfessional: boolean;
  isAesthetic: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  return (
    <ModeContext.Provider
      value={{
        mode: 'aesthetic',
        toggleMode: () => {},
        setMode: () => {},
        isProfessional: false,
        isAesthetic: true,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
