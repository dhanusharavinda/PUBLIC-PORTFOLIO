'use client';

import { AvailabilityStatus } from '@/types/portfolio';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  variant?: 'default' | 'minimal' | 'professional';
}

export function AvailabilityBadge({ status, variant = 'default' }: AvailabilityBadgeProps) {
  const config = {
    open_fulltime: {
      label: 'Open to Full-time',
      className: {
        default: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
        minimal: 'bg-transparent border border-[#8FAF8F] text-[#8FAF8F]',
        professional: 'bg-[#0f2b2a] text-[#4fd1c5]',
      },
    },
    freelance: {
      label: 'Available for Freelance',
      className: {
        default: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
        minimal: 'bg-transparent border border-yellow-500 text-yellow-600',
        professional: 'bg-[#2d2610] text-[#f6e05e]',
      },
    },
    not_looking: {
      label: 'Not Looking',
      className: {
        default: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400',
        minimal: 'bg-transparent border border-gray-400 text-gray-500',
        professional: 'bg-gray-500/20 text-gray-300',
      },
    },
  };

  const { label, className: classNameMap } = config[status];

  return (
    <Badge
      className={cn(
        'font-bold uppercase tracking-wide text-xs px-3 py-1',
        classNameMap[variant]
      )}
    >
      {label}
    </Badge>
  );
}
