'use client';

import { useMode } from '@/lib/mode-context';
import { Briefcase, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = useMode();

  return (
    <button
      onClick={toggleMode}
      className={cn(
        'relative flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-bold transition-all duration-300 border',
        mode === 'professional'
          ? 'bg-white text-stone-700 border-stone-200 hover:border-orange-300 hover:bg-orange-50'
          : 'bg-[#1E1E1E] text-[#FFD60A] border-[#333] hover:border-[#FFD60A]/40 hover:bg-[#252525]',
        className
      )}
      title={`Switch to ${mode === 'professional' ? 'Aesthetic' : 'Professional'} mode`}
    >
      {mode === 'professional' ? (
        <>
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Switch to Aesthetic</span>
        </>
      ) : (
        <>
          <Briefcase className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Switch to Professional</span>
        </>
      )}
    </button>
  );
}
