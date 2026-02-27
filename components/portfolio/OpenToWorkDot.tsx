'use client';

import { cn } from '@/lib/utils';

interface OpenToWorkDotProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function OpenToWorkDot({
  className,
  size = 'md',
  color = '#22c55e',
}: OpenToWorkDotProps) {
  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <span className={cn('absolute flex', sizes[size], className)}>
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full border-2 border-white"
        style={{ backgroundColor: color, width: '100%', height: '100%' }}
      />
    </span>
  );
}
