'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Mode = 'professional' | 'aesthetic';

interface ModeContextType {
  mode: Mode;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
  isProfessional: boolean;
  isAesthetic: boolean;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const STORAGE_KEY = 'portlyfolio-mode';

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('professional');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (stored === 'professional' || stored === 'aesthetic') {
      setModeState(stored);
      document.documentElement.setAttribute('data-mode', stored);
    } else {
      document.documentElement.setAttribute('data-mode', 'professional');
    }
  }, []);

  const setMode = useCallback((newMode: Mode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
    document.documentElement.setAttribute('data-mode', newMode);
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'professional' ? 'aesthetic' : 'professional');
  }, [mode, setMode]);

  return (
    <ModeContext.Provider
      value={{
        mode,
        toggleMode,
        setMode,
        isProfessional: mode === 'professional',
        isAesthetic: mode === 'aesthetic',
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
