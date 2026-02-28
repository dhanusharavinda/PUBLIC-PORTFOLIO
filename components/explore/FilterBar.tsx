'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export type AvailabilityStatus = 'all' | 'open_to_work' | 'freelance' | 'available';

interface FilterBarProps {
  availabilityFilter: AvailabilityStatus;
  onAvailabilityFilterChange: (filter: AvailabilityStatus) => void;
  sort: 'newest' | 'most_viewed' | 'alphabetical';
  onSortChange: (sort: 'newest' | 'most_viewed' | 'alphabetical') => void;
}

export function FilterBar({
  availabilityFilter,
  onAvailabilityFilterChange,
  sort,
  onSortChange,
}: FilterBarProps) {
  const handleAvailabilityClick = (filter: AvailabilityStatus) => {
    // Toggle: if already selected, go back to 'all'
    onAvailabilityFilterChange(availabilityFilter === filter ? 'all' : filter);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 w-full">
      {/* All Filter */}
      <button
        onClick={() => onAvailabilityFilterChange('all')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
          availabilityFilter === 'all'
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-white text-slate-700 border border-stone-100 hover:border-indigo-200 hover:bg-indigo-50'
        )}
      >
        All
      </button>

      {/* Open to Work Filter */}
      <button
        onClick={() => handleAvailabilityClick('open_to_work')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
          availabilityFilter === 'open_to_work'
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
            : 'bg-white text-slate-700 border border-stone-100 hover:border-emerald-200 hover:bg-emerald-50'
        )}
      >
        <span className={cn(
          'w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]',
          availabilityFilter === 'open_to_work' ? 'bg-white' : 'bg-emerald-400'
        )} />
        Open to Work
      </button>

      {/* Freelance Filter */}
      <button
        onClick={() => handleAvailabilityClick('freelance')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
          availabilityFilter === 'freelance'
            ? 'bg-purple-500 text-white shadow-lg shadow-purple-200'
            : 'bg-white text-slate-700 border border-stone-100 hover:border-purple-200 hover:bg-purple-50'
        )}
      >
        <span className={cn(
          'w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]',
          availabilityFilter === 'freelance' ? 'bg-white' : 'bg-purple-400'
        )} />
        Freelance
      </button>

      {/* Available Now (Any availability) */}
      <button
        onClick={() => handleAvailabilityClick('available')}
        className={cn(
          'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm',
          availabilityFilter === 'available'
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
            : 'bg-white text-slate-700 border border-stone-100 hover:border-blue-200 hover:bg-blue-50'
        )}
      >
        <span className={cn(
          'w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]',
          availabilityFilter === 'available' ? 'bg-white' : 'bg-blue-400'
        )} />
        Available Now
      </button>

      <div className="w-px h-8 bg-stone-200 mx-2 hidden md:block" />

      <Select value={sort} onValueChange={(value) => onSortChange(value as 'newest' | 'most_viewed' | 'alphabetical')}>
        <SelectTrigger className="w-full sm:w-[160px] bg-white border-stone-200">
          <SelectValue placeholder="Sort: Newest" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="most_viewed">Most Viewed</SelectItem>
          <SelectItem value="alphabetical">A-Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
